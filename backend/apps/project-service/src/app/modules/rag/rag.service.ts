import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { CommentVector } from './entities/comment-vector.entity';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import type { ConfigType } from '@nestjs/config';
import { ChatGoogle } from '@langchain/google';
import geminiConfig from './config/gemini.config';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { TypeORMVectorStore } from '@langchain/community/vectorstores/typeorm';
import { DataSourceOptions } from 'typeorm';
import { INTENT_QUERY, PROMPT_TEMPLATE, TABLE_NAME } from './constant';
import { CommentService } from '../comment/comment.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
@Injectable()
export class RagService implements OnModuleInit {
  private model!: ChatGoogle;
  private embeddings!: GoogleGenerativeAIEmbeddings;
  private vectorStore!: TypeORMVectorStore;

  constructor(
    @InjectRepository(
      CommentVector,
      process.env.PG_ID_NAME || 'postgres_vector_db',
    )
    private readonly commentVectorRepo: Repository<CommentVector>,

    @Inject(geminiConfig.KEY)
    private geminiConfiguration: ConfigType<typeof geminiConfig>,

    @InjectDataSource(process.env.POST_ID_NAME || 'postgres_vector_db')
    private readonly pgDataSource: DataSource,

    @Inject(process.env.AUTH_SERVICE_NAME || 'AUTH_SERVICE')
    private readonly authClient: ClientProxy,

    private readonly commentService: CommentService,
  ) {}

  async onModuleInit() {
    await this.init();
  }

  async init(): Promise<void> {
    this.model = new ChatGoogle({
      apiKey: this.geminiConfiguration.ApiKey!,
      model: this.geminiConfiguration.chatModel!,
      temperature: 0.2,
    });

    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: this.geminiConfiguration.ApiKey!,
      model: this.geminiConfiguration.embeddingModel,
    });

    this.vectorStore = await TypeORMVectorStore.fromDataSource(
      this.embeddings,
      {
        postgresConnectionOptions: this.pgDataSource.options,
        tableName: TABLE_NAME,
        filter: {},
      },
    );
  }

  async syncCommentToVector(
    commentId: string,
    taskId: string,
    content: string,
  ): Promise<void> {
    try {
      const vector = await this.embeddings.embedQuery(content);

      await this.commentVectorRepo.save({
        pageContent: content, // Bắt buộc thêm dòng này
        metadata: {
          taskId: taskId,
          commentId: commentId,
        },
        embedding: vector,
      });
    } catch (error) {
      console.error('Error when synchronized:', error);
    }
  }

  async summarizeTaskComments(taskId: string): Promise<string> {
    const vectorResults = await this.vectorStore.similaritySearch(
      INTENT_QUERY,
      15,
      { taskId },
    );

    if (!vectorResults || vectorResults.length === 0) {
      return "Don't have enough data for this tasks comment.";
    }

    const commentIds = vectorResults.map((doc) => doc.metadata.commentId);

    const realComments = await this.commentService.findById(commentIds);

    const authorIds = [...new Set(realComments.map((c) => c.user_id))].filter(
      (id) => !!id,
    );

    let userMap = new Map<string, any>();
    try {
      const response = await firstValueFrom(
        this.authClient.send('user.get-by-ids', { ids: authorIds }),
      );

      if (response && response.success) {
        response.data.forEach((user: any) => {
          userMap.set(user.id, user);
        });
      }
    } catch (error) {
      console.error('Auth Service got Error:', error);
    }

    const contextText = realComments
      .map((c) => {
        const user = userMap.get(c.user_id);
        const displayName = user ? user.fullName || user.username : 'Ẩn danh';
        const time =
          c.created_at instanceof Date
            ? c.created_at.toISOString()
            : c.created_at;

        return `[${time}] ${displayName}: ${c.content}`;
      })
      .join('\n');

    const prompt = PromptTemplate.fromTemplate(PROMPT_TEMPLATE);

    const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

    return await chain.invoke({ context: contextText });
  }
}
