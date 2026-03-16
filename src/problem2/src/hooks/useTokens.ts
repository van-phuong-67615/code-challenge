import { useEffect, useState } from "react";
import type { IToken } from "../types";

export default function useTokens() {
  const [tokens, setTokens] = useState<Record<string, IToken>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch("https://interview.switcheo.com/prices.json")
      .then((res) => res.json())
      .then((data: IToken[]) => {
        const tokenMap: Record<string, IToken> = {};
        data.forEach((token) => {
          if (!token.price && typeof token.price !== "number") return;
          const exitToken = tokenMap[token.currency];
          if (!exitToken || new Date(exitToken.date) < new Date(token.date)) {
            tokenMap[token.currency] = token;
          }
        });
        setTokens(tokenMap);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { tokens, loading, error };
}
