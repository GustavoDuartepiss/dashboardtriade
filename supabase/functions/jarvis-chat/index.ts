import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const systemPrompt = `Você é JARVIS, um assistente de vendas expert. Você atua como um closer sênior e líder comercial.

CONTEXTO DO USUÁRIO:
- Metas do mês: Meta1=${context.currentGoal?.meta1 || 0}, Meta2=${context.currentGoal?.meta2 || 0}, Meta3=${context.currentGoal?.meta3 || 0}
- Já fechado: R$ ${context.currentGoal?.achieved || 0}
- Dias úteis restantes: ${context.workingDaysRemaining}
- Follow-ups cadastrados: ${context.followUps?.length || 0}
- Templates disponíveis: ${context.templates?.length || 0}
- Objeções mapeadas: ${context.objections?.length || 0}

OBJEÇÕES CONHECIDAS:
${context.objections?.map((o: any) => `- "${o.objection}" → ${o.bestResponse}`).join('\n') || 'Nenhuma cadastrada'}

REGRAS:
1. Responda sempre como um closer sênior experiente
2. Seja direto e estratégico
3. Use os dados do contexto para personalizar respostas
4. Sugira scripts e abordagens práticas
5. Nunca seja genérico - seja específico para vendas`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit" }), { status: 429, headers: corsHeaders });
      if (status === 402) return new Response(JSON.stringify({ error: "Créditos esgotados" }), { status: 402, headers: corsHeaders });
      return new Response(JSON.stringify({ error: "Erro na IA" }), { status: 500, headers: corsHeaders });
    }

    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), { status: 500, headers: corsHeaders });
  }
});
