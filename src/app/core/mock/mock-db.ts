import { Canal, Categoria, Documento } from '../models';

// Banco em memória do modo demonstração (mesmos dados do DataSeeder da API)
export interface ServicoMock {
  id: number;
  categoriaId: number;
  nome: string;
  descricao: string;
  publicoAlvo: string | null;
  orgaoResponsavel: string;
  canal: Canal;
  urlFonte: string;
  dataVerificacao: string;
  palavrasChave: string | null;
}

export interface RequisitoMock { id: number; servicoId: number; descricao: string; }
export interface EtapaMock { id: number; servicoId: number; ordem: number; descricao: string; }
export interface VinculoMock { servicoId: number; documentoId: number; observacao: string | null; }
export interface InteracaoMock { id: number; resultado: string; servicoIds: number[]; }

export interface MockDb {
  categorias: Categoria[];
  documentos: Documento[];
  servicos: ServicoMock[];
  requisitos: RequisitoMock[];
  etapas: EtapaMock[];
  vinculos: VinculoMock[];
  interacoes: InteracaoMock[];
  seq: number;
}

const V = '2026-11-10';

export function criarMockDb(): MockDb {
  return {
    seq: 1000,
    categorias: [
      { id: 1, nome: 'Trabalho', descricao: 'Emprego, carteira de trabalho e apoio a quem perdeu o emprego.' },
      { id: 2, nome: 'Educação', descricao: 'Cursos gratuitos e qualificação profissional.' },
      { id: 3, nome: 'Documentos', descricao: 'Emissão de documentos pessoais.' },
      { id: 4, nome: 'Benefícios', descricao: 'Programas sociais e cadastros para acesso a benefícios.' },
      { id: 5, nome: 'Saúde', descricao: 'Categoria reservada para a próxima versão do catálogo.' },
    ],
    documentos: [
      { id: 1, nome: 'CPF', descricao: 'Cadastro de Pessoa Física. Número usado para identificar você nos serviços públicos.' },
      { id: 2, nome: 'Documento de identidade com foto', descricao: 'RG, Carteira de Identidade Nacional (CIN) ou outro documento oficial com foto.' },
      { id: 3, nome: 'Comprovante de residência', descricao: 'Conta de luz, água ou similar, para mostrar onde você mora.' },
      { id: 4, nome: 'Certidão de nascimento ou casamento', descricao: 'Registro civil emitido pelo cartório.' },
      { id: 5, nome: 'Requerimento do Seguro-Desemprego', descricao: 'Formulário entregue pelo empregador no momento da demissão.' },
      { id: 6, nome: 'Conta gov.br', descricao: 'Login único do governo federal, criado com o CPF. Necessário para serviços digitais.' },
    ],
    servicos: [
      { id: 1, categoriaId: 1, nome: 'Carteira de Trabalho Digital', descricao: 'Versão digital da carteira de trabalho. Mostra seus contratos e permite consultar vagas do Sine.', publicoAlvo: 'Qualquer pessoa com CPF', orgaoResponsavel: 'Ministério do Trabalho e Emprego', canal: 'DIGITAL', urlFonte: 'https://www.gov.br/pt-br/servicos/obter-a-carteira-de-trabalho', dataVerificacao: V, palavrasChave: 'carteira de trabalho,ctps,carteira digital,registro em carteira,contrato de trabalho' },
      { id: 2, categoriaId: 1, nome: 'Seguro-Desemprego', descricao: 'Ajuda financeira temporária para quem foi demitido sem justa causa.', publicoAlvo: 'Trabalhadores com carteira assinada demitidos sem justa causa', orgaoResponsavel: 'Ministério do Trabalho e Emprego', canal: 'DIGITAL_E_PRESENCIAL', urlFonte: 'https://www.gov.br/pt-br/servicos/solicitar-o-seguro-desemprego', dataVerificacao: V, palavrasChave: 'seguro desemprego,desempregado,desempregada,demitido,demitida,demissao,perdi o emprego,mandado embora,sem justa causa' },
      { id: 3, categoriaId: 1, nome: 'Buscar emprego no Sine', descricao: 'Cadastro no Sistema Nacional de Emprego para receber e consultar vagas.', publicoAlvo: 'Pessoas procurando trabalho com carteira assinada', orgaoResponsavel: 'Ministério do Trabalho e Emprego', canal: 'DIGITAL_E_PRESENCIAL', urlFonte: 'https://www.gov.br/pt-br/servicos/buscar-emprego-no-sistema-nacional-de-emprego-sine', dataVerificacao: V, palavrasChave: 'emprego,vaga,vagas,trabalho,sine,procurar emprego,curriculo,desempregado,desempregada' },
      { id: 4, categoriaId: 2, nome: 'Cursos gratuitos - Escola do Trabalhador 4.0', descricao: 'Cursos online e gratuitos de tecnologia e produtividade do programa Caminho Digital.', publicoAlvo: 'Trabalhadores que querem se qualificar', orgaoResponsavel: 'Ministério do Trabalho e Emprego', canal: 'DIGITAL', urlFonte: 'https://www.gov.br/trabalho-e-emprego/pt-br/servicos/trabalhador/qualificacao-profissional/caminho-digital', dataVerificacao: V, palavrasChave: 'curso,gratuito,gratis,online,qualificacao,capacitacao,aprender,tecnologia,informatica,certificado' },
      { id: 5, categoriaId: 3, nome: 'Carteira de Identidade Nacional (CIN)', descricao: 'Nova carteira de identidade, que usa o CPF como número. A primeira via é gratuita.', publicoAlvo: 'Todos os brasileiros', orgaoResponsavel: 'Institutos de identificação dos estados', canal: 'DIGITAL_E_PRESENCIAL', urlFonte: 'https://www.gov.br/identidade', dataVerificacao: V, palavrasChave: 'rg,identidade,cin,carteira de identidade,documento de identidade,segunda via,tirar documento' },
      { id: 6, categoriaId: 4, nome: 'Inscrição no Cadastro Único (CadÚnico)', descricao: 'Cadastro que dá acesso a vários programas sociais do governo.', publicoAlvo: 'Famílias com renda de até meio salário mínimo por pessoa', orgaoResponsavel: 'Prefeitura (CRAS / posto do Cadastro Único)', canal: 'PRESENCIAL', urlFonte: 'https://www.gov.br/pt-br/servicos/inscrever-se-no-cadastro-unico-para-programas-sociais-do-governo-federal', dataVerificacao: V, palavrasChave: 'cadunico,cadastro unico,beneficio,bolsa familia,programa social,baixa renda,auxilio,cras' },
    ],
    requisitos: [
      { id: 1, servicoId: 1, descricao: 'Ter CPF.' },
      { id: 2, servicoId: 1, descricao: 'Ter conta gov.br (nível bronze, prata ou ouro).' },
      { id: 3, servicoId: 2, descricao: 'Ter sido demitido sem justa causa.' },
      { id: 4, servicoId: 2, descricao: 'Ter recebido salário pelo tempo mínimo exigido (muda se é a 1ª, 2ª ou demais solicitações).' },
      { id: 5, servicoId: 2, descricao: 'Não ter renda própria suficiente para o sustento da família.' },
      { id: 6, servicoId: 3, descricao: 'Ter CPF e conta gov.br para usar os canais digitais.' },
      { id: 7, servicoId: 4, descricao: 'Ter acesso à internet.' },
      { id: 8, servicoId: 4, descricao: 'Fazer cadastro na plataforma da Escola do Trabalhador 4.0.' },
      { id: 9, servicoId: 5, descricao: 'Comparecer ao posto no dia agendado (coleta de biometria é presencial).' },
      { id: 10, servicoId: 6, descricao: 'Renda familiar de até meio salário mínimo por pessoa (há exceções para programas específicos).' },
    ],
    etapas: [
      { id: 1, servicoId: 1, ordem: 1, descricao: 'Baixe o aplicativo Carteira de Trabalho Digital ou acesse pela web.' },
      { id: 2, servicoId: 1, ordem: 2, descricao: 'Entre com seu CPF e a senha da conta gov.br.' },
      { id: 3, servicoId: 1, ordem: 3, descricao: 'Confira seus contratos. Se algo estiver errado, procure a empresa ou o canal 158.' },
      { id: 4, servicoId: 2, ordem: 1, descricao: 'Guarde o Requerimento do Seguro-Desemprego entregue pela empresa.' },
      { id: 5, servicoId: 2, ordem: 2, descricao: 'Solicite pelo app Carteira de Trabalho Digital, pelo gov.br ou com atendimento agendado.' },
      { id: 6, servicoId: 2, ordem: 3, descricao: 'Acompanhe a liberação das parcelas pelo app ou pelo gov.br.' },
      { id: 7, servicoId: 3, ordem: 1, descricao: 'Cadastre-se no Sine pelo Portal Emprega Brasil, app Carteira de Trabalho Digital ou posto do Sine.' },
      { id: 8, servicoId: 3, ordem: 2, descricao: 'Mantenha seu currículo e perfil profissional atualizados.' },
      { id: 9, servicoId: 3, ordem: 3, descricao: 'Consulte as vagas compatíveis com seu cadastro e candidate-se.' },
      { id: 10, servicoId: 4, ordem: 1, descricao: 'Acesse a página do Caminho Digital e clique em “Faça seu cadastro”.' },
      { id: 11, servicoId: 4, ordem: 2, descricao: 'Escolha um curso e estude no seu ritmo.' },
      { id: 12, servicoId: 5, ordem: 1, descricao: 'Acesse gov.br/identidade, escolha seu estado e agende o atendimento.' },
      { id: 13, servicoId: 5, ordem: 2, descricao: 'Leve a certidão de nascimento ou casamento original no dia marcado.' },
      { id: 14, servicoId: 5, ordem: 3, descricao: 'Depois de emitida, adicione a CIN digital no aplicativo gov.br.' },
      { id: 15, servicoId: 6, ordem: 1, descricao: 'Encontre o CRAS ou posto do Cadastro Único mais próximo.' },
      { id: 16, servicoId: 6, ordem: 2, descricao: 'Leve os documentos do responsável e de cada pessoa da família.' },
      { id: 17, servicoId: 6, ordem: 3, descricao: 'Faça a entrevista (cerca de 1 hora, gratuita).' },
    ],
    vinculos: [
      { servicoId: 1, documentoId: 1, observacao: null },
      { servicoId: 1, documentoId: 6, observacao: null },
      { servicoId: 2, documentoId: 5, observacao: 'Entregue pelo empregador na demissão.' },
      { servicoId: 2, documentoId: 1, observacao: null },
      { servicoId: 2, documentoId: 6, observacao: 'Necessária para pedir pela internet.' },
      { servicoId: 3, documentoId: 1, observacao: null },
      { servicoId: 3, documentoId: 2, observacao: 'Para atendimento presencial.' },
      { servicoId: 4, documentoId: 1, observacao: null },
      { servicoId: 5, documentoId: 4, observacao: 'Original.' },
      { servicoId: 5, documentoId: 1, observacao: null },
      { servicoId: 6, documentoId: 2, observacao: 'Do responsável pela família.' },
      { servicoId: 6, documentoId: 1, observacao: 'Preferencialmente de todos da família.' },
      { servicoId: 6, documentoId: 3, observacao: 'Ou declaração de residência.' },
    ],
    interacoes: [],
  };
}
