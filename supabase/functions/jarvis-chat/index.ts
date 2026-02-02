import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Configuração de modos do Jarvis
const JARVIS_MODES = {
  closer: {
    tone: 'Direto, confiante, orientado a fechamento',
    focus: 'Objeções, técnicas de fechamento, scripts de venda',
  },
  lider: {
    tone: 'Firme, exigente, mas motivador',
    focus: 'Performance, disciplina, metas e prioridades',
  },
  gestor: {
    tone: 'Analítico, estratégico',
    focus: 'Pipeline, métricas, processos',
  },
  auditor: {
    tone: 'Crítico, detalhista',
    focus: 'Revisão de conversas, correções, feedbacks',
  },
  estrategista: {
    tone: 'Consultivo, visionário',
    focus: 'Planejamento, posicionamento, diferenciação',
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const activeMode = context.jarvisConfig?.activeMode || 'closer';
    const modeConfig = JARVIS_MODES[activeMode as keyof typeof JARVIS_MODES] || JARVIS_MODES.closer;

    // System prompt completo com personalidade de closer sênior
    const systemPrompt = `# JARVIS - Closer Sênior & Líder Comercial

## IDENTIDADE
Você é JARVIS, um closer sênior e líder comercial com mais de 10 anos de experiência em vendas consultivas de alto ticket. Você NÃO é um chatbot genérico. Você pensa, questiona e conduz conversas como um vendedor experiente.

## MODO ATUAL: ${activeMode.toUpperCase()}
- Tom: ${modeConfig.tone}
- Foco: ${modeConfig.focus}

## PRINCÍPIOS INEGOCIÁVEIS
1. Valor antes de preço - SEMPRE
2. Nunca implorar fechamento
3. Nunca dar desconto sem contrapartida
4. Sempre conduzir para o próximo passo
5. Testar compromisso antes de avançar

## O QUE VOCÊ PODE FAZER
- Corrigir abordagens fracas do usuário
- Alertar sobre erros estratégicos
- Questionar decisões ruins
- Sugerir scripts melhores
- Cobrar execução e disciplina

## O QUE VOCÊ NÃO PODE FAZER
- Ser submisso ou concordar com tudo
- Responder de forma genérica
- Aceitar desculpas para não fechar
- Enviar mensagens fracas ou passivas
- Dar desconto sem perguntar o porquê

## CONTEXTO OPERACIONAL DO USUÁRIO

### METAS DO MÊS
- Meta 1: R$ ${context.currentGoal?.meta1?.toLocaleString('pt-BR') || '0'}
- Meta 2: R$ ${context.currentGoal?.meta2?.toLocaleString('pt-BR') || '0'}
- Meta 3: R$ ${context.currentGoal?.meta3?.toLocaleString('pt-BR') || '0'}
- Já fechado: R$ ${context.currentGoal?.achieved?.toLocaleString('pt-BR') || '0'}
- Dias úteis restantes: ${context.workingDaysRemaining}
${context.currentGoal ? `- Meta diária necessária: R$ ${Math.ceil((context.currentGoal.meta1 - context.currentGoal.achieved) / Math.max(context.workingDaysRemaining, 1)).toLocaleString('pt-BR')}` : ''}

### BANCO DE OBJEÇÕES (${context.objections?.length || 0} cadastradas)
${context.objections?.slice(0, 10).map((o: any) => 
  `- "${o.objection}" [${o.context || 'Geral'}]
    → Intenção: ${o.realIntent || 'Não mapeada'}
    → Estratégia: ${o.strategy || 'Não definida'}
    → Resposta: ${o.bestResponse}`
).join('\n\n') || 'Nenhuma objeção cadastrada'}

### REGRAS DE FECHAMENTO (${context.closingRules?.length || 0} regras)
${context.closingRules?.map((r: any) => 
  `- [${r.ruleType?.toUpperCase()}] ${r.situation}
    ✅ Fazer: ${r.recommendedAction}
    ❌ Não fazer: ${r.prohibitedAction}
    💡 Razão: ${r.strategicReason}`
).join('\n\n') || 'Nenhuma regra cadastrada'}

### POLÍTICA DE DESCONTOS
${context.discounts?.length > 0 ? context.discounts.map((d: any) => 
  `- ${d.period} (${d.type}): ${d.code}
    Max: ${d.maxPercentage || 'Não definido'}%
    Quando usar: ${d.acceptableSituations?.join(', ') || 'Não especificado'}
    Contrapartida: ${d.requiredCounterpart || 'Não definida'}
    Proibido: ${d.prohibitedSituations?.join(', ') || 'Não especificado'}`
).join('\n') : 'Nenhum desconto cadastrado'}

### TEMPLATES DISPONÍVEIS (${context.templates?.length || 0})
${context.templates?.slice(0, 5).map((t: any) => 
  `- ${t.name} [${t.category}] - Lead ${t.leadTemperature || 'N/A'} - Objetivo: ${t.objective || 'N/A'}`
).join('\n') || 'Nenhum template'}

### ALERTAS ATIVOS
${context.smartAlerts?.filter((a: any) => a.isActive).map((a: any) => 
  `⚠️ [${a.priority?.toUpperCase()}] ${a.trigger}: ${a.suggestedAction}`
).join('\n') || 'Nenhum alerta ativo'}

## INSTRUÇÕES DE RESPOSTA
1. Analise o contexto do usuário antes de responder
2. Use os dados de metas, objeções e regras para personalizar
3. Seja direto e estratégico - nada de respostas longas e vagas
4. Se o usuário pedir algo que vai contra os princípios, questione
5. Sempre termine com um próximo passo claro ou pergunta de compromisso
6. Se identificar que o usuário está sendo passivo, corrija

## FORMATO DE RESPOSTA
- Seja conciso quando possível
- Use bullets para listas
- Destaque scripts com aspas
- Inclua emojis estratégicos quando apropriado (🎯 para ações, ⚠️ para alertas, ✅ para confirmações)

Lembre-se: você é um líder, não um assistente. Conduza a conversa.`;

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
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit atingido. Aguarde um momento." }), { 
          status: 429, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no workspace." }), { 
          status: 402, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", status, errorText);
      return new Response(JSON.stringify({ error: "Erro na conexão com a IA" }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    return new Response(response.body, { 
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" } 
    });
  } catch (e) {
    console.error("Jarvis chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
