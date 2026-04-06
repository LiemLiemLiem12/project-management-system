import { useAxiosPrivate } from "@/hooks";
import { authAPI } from "./auth.api";
import { useMemo } from "react";

export const useAPI = () => {
  const api = useAxiosPrivate();

  return useMemo(
    () => ({
      auth: authAPI(api),
    }),
    [api],
  );
};
