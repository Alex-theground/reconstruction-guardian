import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export function useSiteContent<T = Record<string, unknown>>(sectionKey: string) {
  const [content, setContent] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from("site_content")
      .select("content")
      .eq("section_key", sectionKey)
      .maybeSingle();
    setContent(data?.content as T | null);
    setLoading(false);
  }, [sectionKey]);

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel(`site_content:${sectionKey}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_content", filter: `section_key=eq.${sectionKey}` },
        (payload) => {
          const newRow = (payload.new ?? null) as { content?: unknown } | null;
          if (newRow && "content" in newRow) {
            setContent(newRow.content as T);
          } else {
            fetch();
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetch, sectionKey]);

  const save = useCallback(async (newContent: T) => {
    const { error } = await supabase
      .from("site_content")
      .upsert(
        { section_key: sectionKey, content: newContent as unknown as Json, updated_at: new Date().toISOString() },
        { onConflict: "section_key" }
      );
    if (error) throw error;
    setContent(newContent);
  }, [sectionKey]);

  return { content, loading, save, refetch: fetch };
}

export function useAllSiteContent() {
  const [contents, setContents] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("section_key, content")
      .then(({ data }) => {
        const map: Record<string, unknown> = {};
        data?.forEach((row) => { map[row.section_key] = row.content; });
        setContents(map);
        setLoading(false);
      });
  }, []);

  return { contents, loading };
}
