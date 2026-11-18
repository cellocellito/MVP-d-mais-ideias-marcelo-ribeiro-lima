-- D+Ideias: ideias de exemplo (fábrica de peças plásticas injetadas).
-- Rodar uma única vez, logo depois do schema.sql. Rodar de novo duplica os exemplos.
--
-- O criado_em é informado de propósito, para simular a rotina real:
-- as fichas de um mês são recolhidas da urna e digitadas no começo do mês seguinte.
-- Por isso a data de registro (escrita na ficha) é sempre anterior à data de cadastro.

SET NAMES utf8mb4;

USE dmais_ideias;

INSERT INTO ideias
  (re_autor, o_que_melhorar, como_feito_hoje, como_melhorar, beneficio, data_registro, criado_em)
VALUES
  -- Fichas de agosto, digitadas em 02/09
  ('1043',
   'Tempo de troca de molde nas injetoras',
   'Quando a máquina para para a troca, o operador vai até o almoxarifado buscar ferramentas, parafusos e mangueiras. O molde novo também só é aquecido depois de montado. A troca leva cerca de 1h30.',
   'Montar um carrinho de setup para cada injetora, com todas as ferramentas e peças de fixação. Separar e pré-aquecer o próximo molde ao lado da máquina antes da parada.',
   'A troca deve cair para menos de 1 hora, sobrando mais tempo de máquina produzindo.',
   '2026-08-05', '2026-09-02 08:40:00'),

  ('0587',
   'Reaproveitamento dos galhos de injeção',
   'Os galhos (canais de alimentação) vão para a caçamba de refugo junto com as peças reprovadas e são vendidos como sucata.',
   'Moer os galhos no moinho ao lado da máquina e misturar uma parte ao material virgem, nos produtos em que a Engenharia aprovar.',
   'Menos compra de matéria-prima e menos sucata gerada.',
   '2026-08-12', '2026-09-02 08:52:00'),

  ('2210',
   'Identificação do material na estufa de secagem',
   'Os sacos de material ficam na estufa sem nenhuma etiqueta. O operador não sabe a que horas o material entrou nem se já secou o tempo necessário.',
   'Colocar em cada lote uma etiqueta com o tipo de material, o lote, a hora de entrada e a hora mínima de saída.',
   'Menos peças com bolhas e manchas causadas por umidade no material.',
   '2026-08-20', '2026-09-02 09:05:00'),

  -- Fichas de setembro, digitadas em 01/10
  ('1043',
   'Rebarba nas tampas produzidas na injetora 07',
   'As tampas saem com rebarba na borda. O operador tira a rebarba com estilete, peça por peça, antes de embalar.',
   'Pedir à Ferramentaria a revisão da linha de fechamento do molde e incluir a limpeza do molde no checklist semanal da máquina.',
   'Fim do retrabalho manual e menos risco de corte com o estilete.',
   '2026-09-03', '2026-10-01 14:10:00'),

  -- Esta ficha tem quebras de linha (\n), para mostrar que o detalhe as respeita.
  ('3175',
   'Amostra padrão para a inspeção visual no fim da linha',
   'O inspetor compara as peças com a amostra padrão que fica guardada na sala da Qualidade.\nQuando surge uma dúvida, ele precisa sair da linha para buscar a amostra, e as peças ficam acumulando.',
   '1. Deixar uma amostra padrão aprovada em cada posto de inspeção.\n2. Colocar ao lado uma folha com fotos dos defeitos mais comuns: rebarba, falha de injeção e mancha.\n3. Trocar a amostra sempre que o molde passar por revisão.',
   'Inspeção mais rápida e o mesmo critério de aprovação nos três turnos.',
   '2026-09-15', '2026-10-01 14:25:00'),

  -- Fichas de outubro, digitadas em 03/11
  ('0942',
   'Vazamentos de ar comprimido nos robôs de extração',
   'Os vazamentos nas mangueiras só são percebidos pelo barulho, quando a fábrica está parada no fim de semana.',
   'Fazer uma ronda mensal com a fábrica em funcionamento, marcar cada vazamento com uma etiqueta e abrir ordem de manutenção.',
   'Menor consumo de energia do compressor e menos paradas por falta de pressão.',
   '2026-10-01', '2026-11-03 10:02:00'),

  ('4518',
   'Embalagem das peças pintadas enviadas ao cliente',
   'As peças vão em caixas de papelão descartáveis. As caixas amassam no transporte e as peças chegam arranhadas.',
   'Combinar com o cliente o uso de caixas plásticas retornáveis, com divisórias para cada peça.',
   'Menos peças devolvidas por arranhão e menos compra de papelão.',
   '2026-10-14', '2026-11-03 10:15:00'),

  ('2210',
   'Aviso de funil vazio nas injetoras',
   'O operador só percebe que o funil ficou sem material quando a máquina começa a produzir peças incompletas.',
   'Instalar um sensor de nível baixo no funil, ligado a uma luz de aviso na máquina.',
   'Menos peças com falha de injeção e menos refugo na hora de reiniciar a produção.',
   '2026-10-22', '2026-11-03 10:31:00');
