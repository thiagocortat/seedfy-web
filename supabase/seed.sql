-- Seed: Jornada da Gratidão
-- Este arquivo popula o banco de dados com uma Jornada completa de 7 dias.

WITH journey_insert AS (
  INSERT INTO public.journey_templates (
    id,
    title,
    description_short,
    description_long,
    cover_image_url,
    tags,
    durations_supported,
    is_active
  ) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Jornada da Gratidão',
    'Transforme seu olhar sobre a vida em 7 dias através do poder da gratidão.',
    'A gratidão não é apenas um sentimento, é uma disciplina espiritual que pode mudar a forma como experimentamos a vida. Nesta jornada de 7 dias, vamos explorar como cultivar um coração grato pode trazer paz, alegria e uma conexão mais profunda com Deus. A cada dia, você terá uma reflexão, um texto bíblico e uma prática simples para aplicar o que aprendeu.',
    'https://images.unsplash.com/photo-1507692049790-de58293a469d?q=80&w=2070&auto=format&fit=crop',
    '["Espiritualidade", "Gratidão", "Hábito", "Paz"]',
    ARRAY[7, 14, 21],
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description_short = EXCLUDED.description_short,
    description_long = EXCLUDED.description_long,
    tags = EXCLUDED.tags,
    durations_supported = EXCLUDED.durations_supported,
    is_active = EXCLUDED.is_active
  RETURNING id
)
INSERT INTO public.journey_chapter_templates (
  journey_id,
  day_index,
  title,
  focus,
  narrative,
  practice,
  reflection_prompt,
  prayer,
  verse_reference,
  verse_text,
  media_type
) VALUES
-- Dia 1
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  1,
  'O Poder do Agradecimento',
  'Reconhecer que tudo vem de Deus',
  'Muitas vezes passamos pela vida focados no que nos falta, esquecendo de celebrar o que já temos. A gratidão é a chave que vira a chave da escassez para a abundância. Não se trata de ter tudo, mas de reconhecer a mão de Deus em tudo. Quando agradecemos, mudamos nossa frequência espiritual e abrimos os olhos para as bênçãos que estavam invisíveis.',
  'Durante o dia, pare por 3 momentos e diga "Obrigado, Deus" por algo que você viu ou sentiu.',
  'Qual foi a última vez que você agradeceu por algo simples, como o ar que respira?',
  'Senhor, ensina-me a ver Tua bondade em cada detalhe do meu dia. Que minha primeira reação seja agradecer, e não reclamar.',
  '1 Tessalonicenses 5:18',
  'Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.',
  null
),
-- Dia 2
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  2,
  'Gratidão nas Pequenas Coisas',
  'Encontrar beleza no ordinário',
  'É fácil agradecer por uma grande promoção ou um milagre, mas a verdadeira gratidão vive no ordinário. O cheiro do café, o sorriso de um estranho, o conforto da sua cama. Deus se manifesta nos detalhes. Cultivar a atenção plena para essas pequenas dádivas é o que constrói uma vida de contentamento constante.',
  'Tire uma foto de algo simples que te fez sorrir hoje e guarde como um memorial de gratidão.',
  'Liste 3 coisas "banais" que aconteceram hoje e que foram presentes de Deus para você.',
  'Pai, perdoa-me por ignorar Tuas pequenas cartas de amor diárias. Abre meus olhos para o extraordinário disfarçado de rotina.',
  'Salmos 118:24',
  'Este é o dia que fez o Senhor; regozijemo-nos e alegremo-nos nele.',
  null
),
-- Dia 3
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  3,
  'Agradecendo pelas Pessoas',
  'Valorizar quem caminha conosco',
  'Ninguém chega a lugar nenhum sozinho. Deus coloca pessoas em nosso caminho para nos moldar, apoiar e amar. Às vezes, esquecemos de verbalizar o quanto elas são importantes. A gratidão não expressa é como um presente embrulhado que nunca foi entregue.',
  'Envie uma mensagem de texto para alguém importante dizendo: "Sou grato a Deus pela sua vida porque..."',
  'Quem é a pessoa que mais te apoiou no último ano? Você já agradeceu a ela?',
  'Deus, obrigado por cada vida que cruza meu caminho. Usa-me para ser uma bênção na vida deles também.',
  'Filipenses 1:3',
  'Dou graças ao meu Deus todas as vezes que me lembro de vós.',
  null
),
-- Dia 4
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  4,
  'Gratidão nas Dificuldades',
  'Confiar no propósito maior',
  'Agradecer quando tudo vai bem é natural. Agradecer na tempestade é sobrenatural. A gratidão na dificuldade não é masoquismo, é uma declaração de fé de que Deus é maior que o problema e que Ele está no controle, trabalhando todas as coisas para o nosso bem.',
  'Identifique um desafio atual e tente encontrar uma lição ou aspecto positivo nele para agradecer.',
  'O que esse momento difícil pode estar tentando te ensinar ou fortalecer em você?',
  'Senhor, mesmo sem entender tudo, eu Te louvo. Sei que Teus planos são maiores que os meus.',
  'Tiago 1:2-3',
  'Meus irmãos, tende por motivo de toda alegria o passardes por várias provações...',
  null
),
-- Dia 5
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  5,
  'O Hábito de Agradecer',
  'Criando rituais de gratidão',
  'A gratidão precisa ser exercitada como um músculo. Se não praticamos, ela atrofia e a reclamação toma conta. Criar rituais diários — ao acordar, nas refeições, ao dormir — nos mantém ancorados na bondade de Deus, blindando nossa mente contra a negatividade.',
  'Hoje, antes de cada refeição, faça uma oração consciente de gratidão pelo alimento e por quem o preparou.',
  'Qual momento do seu dia seria ideal para inserir uma pausa de gratidão?',
  'Espírito Santo, lembra-me de agradecer. Que a gratidão seja o ritmo natural do meu coração.',
  'Colossenses 3:15',
  'E a paz de Cristo... domine em vossos corações; e sede agradecidos.',
  null
),
-- Dia 6
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  6,
  'Expressando Gratidão',
  'A gratidão deve ser audível',
  'Sentir gratidão faz bem a você; expressar gratidão muda o ambiente. Palavras de afirmação e agradecimento têm poder de cura e restauração. Não guarde para si o que pode iluminar o dia de outra pessoa ou glorificar a Deus publicamente.',
  'Elogie sinceramente alguém hoje, destacando uma qualidade específica pela qual você é grato.',
  'Como você se sente quando alguém te agradece sinceramente? Use isso como motivação.',
  'Senhor, que meus lábios sejam uma fonte de vida e gratidão. Que eu não retenha o bem que posso dizer.',
  'Salmos 107:1',
  'Louvai ao Senhor, porque ele é bom, porque a sua benignidade dura para sempre.',
  null
),
-- Dia 7
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  7,
  'Uma Vida de Gratidão',
  'Um estilo de vida, não um evento',
  'Chegamos ao fim desta jornada, mas é apenas o começo. A gratidão é um estilo de vida. É escolher, todos os dias, focar na Graça e não na falta. É viver com as mãos abertas para receber e para doar. Que a gratidão seja a marca registrada da sua caminhada com Cristo.',
  'Escreva uma carta de gratidão a Deus pelo que Ele fez nesta semana e guarde na sua Bíblia.',
  'O que mudou na sua percepção ou humor ao longo destes 7 dias de prática?',
  'Pai, obrigado por esta jornada. Que a semente da gratidão cresça e dê frutos eternos em minha vida. Amém.',
  'Salmos 103:1-2',
  'Bendize, ó minha alma, ao Senhor, e não te esqueças de nenhum de seus benefícios.',
  null
)
ON CONFLICT (journey_id, day_index) DO UPDATE SET
  title = EXCLUDED.title,
  focus = EXCLUDED.focus,
  narrative = EXCLUDED.narrative,
  practice = EXCLUDED.practice,
  reflection_prompt = EXCLUDED.reflection_prompt,
  prayer = EXCLUDED.prayer,
  verse_reference = EXCLUDED.verse_reference,
  verse_text = EXCLUDED.verse_text,
  media_type = EXCLUDED.media_type;
