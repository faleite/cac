/**
 * CAC Atividades - Controller de Registos Diários (Módulo Operador e Auditoria)
 * Conforme especificações do docs/FSD.md (Seção 10, 11, 13 e 14)
 */

const prisma = require('../database/prisma');
const {
  somarIncidencias,
  calcularEntregues,
  calcularEficiencia,
  calcularKmPercorridos,
  validarDadosFecho
} = require('../utils/calculos');

/**
 * Função utilitária para obter a data no formato Date (sem horas, fuso seguro)
 * @param {string|Date} [dataInput]
 * @returns {Date}
 */
function normalizarData(dataInput) {
  if (dataInput) {
    const d = new Date(dataInput);
    if (!isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
  }
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
}

/**
 * Utilitário para formatar BigInt e Decimal para JSON amigável
 * @param {Object} item
 * @returns {Object}
 */
function formatarRegisto(item) {
  if (!item) return null;
  return {
    ...item,
    id: item.id ? item.id.toString() : undefined,
    usuarioId: item.usuarioId ? item.usuarioId.toString() : undefined,
    taxaEficiencia: item.taxaEficiencia ? Number(item.taxaEficiencia).toFixed(2) : '0.00',
    dataRegisto: item.dataRegisto instanceof Date 
      ? item.dataRegisto.toISOString().split('T')[0] 
      : item.dataRegisto,
    usuario: item.usuario ? {
      ...item.usuario,
      id: item.usuario.id ? item.usuario.id.toString() : undefined,
      senhaHash: undefined
    } : undefined,
    auditorias: Array.isArray(item.auditorias) ? item.auditorias.map(a => ({
      ...a,
      id: a.id ? a.id.toString() : undefined,
      registoDiarioId: a.registoDiarioId ? a.registoDiarioId.toString() : undefined,
      usuarioAlteracaoId: a.usuarioAlteracaoId ? a.usuarioAlteracaoId.toString() : undefined,
      usuarioAlteracao: a.usuarioAlteracao ? {
        id: a.usuarioAlteracao.id ? a.usuarioAlteracao.id.toString() : undefined,
        nomeCompleto: a.usuarioAlteracao.nomeCompleto,
        numeroSc: a.usuarioAlteracao.numeroSc
      } : undefined
    })) : undefined
  };
}

class RegistoDiarioController {
  /**
   * Consulta o estado operacional do dia atual e pendências de dias anteriores
   * GET /api/registos/estado-atual
   */
  static async obterEstadoAtual(req, res) {
    try {
      const usuarioId = BigInt(req.session.usuario.id);
      const dataHoje = normalizarData();

      // 1. Busca turno do dia de hoje
      const registoHoje = await prisma.registoDiario.findUnique({
        where: {
          unq_usuario_data_registo: {
            usuarioId,
            dataRegisto: dataHoje
          }
        }
      });

      // 2. Busca turno pendente de dia anterior (dataRegisto < hoje e status = 'aberto')
      const registoPendente = await prisma.registoDiario.findFirst({
        where: {
          usuarioId,
          dataRegisto: { lt: dataHoje },
          status: 'aberto'
        },
        orderBy: { dataRegisto: 'desc' }
      });

      // 3. Busca preferências habituais de perfil
      const perfilConfig = await prisma.perfilConfiguracao.findUnique({
        where: { usuarioId }
      });

      const statusDia = registoHoje ? registoHoje.status : 'nenhum';

      return res.json({
        status: 'sucesso',
        dados: {
          statusDia,
          dataHoje: dataHoje.toISOString().split('T')[0],
          registoHoje: formatarRegisto(registoHoje),
          pendenciaAnterior: Boolean(registoPendente),
          registoPendente: formatarRegisto(registoPendente),
          preferencias: {
            matriculaPadrao: perfilConfig?.matriculaPadrao || '',
            giroPadrao: perfilConfig?.giroPadrao || ''
          }
        }
      });
    } catch (error) {
      console.error('[ERRO OBTER ESTADO ATUAL]', error);
      return res.status(500).json({
        status: 'erro',
        mensagem: 'Falha ao consultar estado operacional do colaborador.'
      });
    }
  }

  /**
   * Registo de Início de Turno (Abertura)
   * POST /api/registos/abertura
   */
  static async abrirTurno(req, res) {
    try {
      const usuarioId = BigInt(req.session.usuario.id);
      const { kmInicial, matriculaDia, giroDia, dataRegisto } = req.body;

      // Validações de entrada
      const km = parseInt(kmInicial, 10);
      if (isNaN(km) || km < 0) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'O Km Inicial é obrigatório e deve ser um número maior ou igual a zero.'
        });
      }

      if (!matriculaDia || String(matriculaDia).trim() === '') {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'A Matrícula do veículo é obrigatória.'
        });
      }

      if (!giroDia || String(giroDia).trim() === '') {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'O Código do Giro é obrigatório.'
        });
      }

      const dataAlvo = normalizarData(dataRegisto);

      // Verifica unicidade de turno por dia
      const registoExistente = await prisma.registoDiario.findUnique({
        where: {
          unq_usuario_data_registo: {
            usuarioId,
            dataRegisto: dataAlvo
          }
        }
      });

      if (registoExistente) {
        return res.status(400).json({
          status: 'erro',
          mensagem: `Já existe um turno ${registoExistente.status} registado para esta data (${dataAlvo.toISOString().split('T')[0]}). Não é permitida abertura duplicada.`
        });
      }

      // Criação do novo registo diário com status 'aberto'
      const novoRegisto = await prisma.registoDiario.create({
        data: {
          usuarioId,
          dataRegisto: dataAlvo,
          status: 'aberto',
          kmInicial: km,
          matriculaDia: String(matriculaDia).trim().toUpperCase(),
          giroDia: String(giroDia).trim().toUpperCase(),
          dataHoraAbertura: new Date()
        }
      });

      return res.status(201).json({
        status: 'sucesso',
        mensagem: 'Turno de trabalho iniciado com sucesso!',
        dados: formatarRegisto(novoRegisto)
      });
    } catch (error) {
      console.error('[ERRO ABERTURA TURNO]', error);
      return res.status(500).json({
        status: 'erro',
        mensagem: 'Ocorreu um erro interno ao registar a abertura de turno.'
      });
    }
  }

  /**
   * Registo de Fim de Turno (Fecho com Validações Matemáticas)
   * POST /api/registos/fecho
   */
  static async fecharTurno(req, res) {
    try {
      const usuarioId = BigInt(req.session.usuario.id);
      const perfilUsuario = req.session.usuario.perfil;
      const {
        registoId,
        kmFinal,
        qtdObjetos,
        qtdRecolhas,
        qtdAvisados,
        qtdRetornos,
        qtdEndInsuficiente,
        qtdRecusados,
        qtdDescMorada
      } = req.body;

      // Localiza o registo a fechar
      let registo;
      if (registoId) {
        registo = await prisma.registoDiario.findUnique({
          where: { id: BigInt(registoId) }
        });
      } else {
        // Se registoId não foi informado, busca o turno aberto do dia
        const dataHoje = normalizarData();
        registo = await prisma.registoDiario.findUnique({
          where: {
            unq_usuario_data_registo: {
              usuarioId,
              dataRegisto: dataHoje
            }
          }
        });

        // Caso não haja hoje, busca o turno aberto mais recente
        if (!registo) {
          registo = await prisma.registoDiario.findFirst({
            where: { usuarioId, status: 'aberto' },
            orderBy: { dataRegisto: 'desc' }
          });
        }
      }

      if (!registo) {
        return res.status(404).json({
          status: 'erro',
          mensagem: 'Nenhum turno aberto foi localizado para encerramento.'
        });
      }

      // Verificação de permissão
      if (registo.usuarioId !== usuarioId && perfilUsuario !== 'administrador') {
        return res.status(403).json({
          status: 'erro',
          mensagem: 'Não tem permissão para fechar o turno de outro colaborador.'
        });
      }

      if (registo.status === 'fechado') {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'Este turno já se encontra fechado.'
        });
      }

      // Validação de dados matemáticos
      const validacao = validarDadosFecho({
        kmInicial: registo.kmInicial,
        kmFinal,
        qtdObjetos,
        qtdRecolhas,
        qtdAvisados,
        qtdRetornos,
        qtdEndInsuficiente,
        qtdRecusados,
        qtdDescMorada
      });

      if (!validacao.valido) {
        return res.status(400).json({
          status: 'erro',
          mensagem: validacao.erros[0],
          erros: validacao.erros
        });
      }

      // Cálculos oficiais conforme FSD Seção 14
      const finalKm = parseInt(kmFinal, 10);
      const totalObjetos = parseInt(qtdObjetos, 10);
      const totalRecolhas = parseInt(qtdRecolhas || 0, 10);
      const avisados = Math.max(0, parseInt(qtdAvisados || 0, 10));
      const retornos = Math.max(0, parseInt(qtdRetornos || 0, 10));
      const endInsuf = Math.max(0, parseInt(qtdEndInsuficiente || 0, 10));
      const recusados = Math.max(0, parseInt(qtdRecusados || 0, 10));
      const descMorada = Math.max(0, parseInt(qtdDescMorada || 0, 10));

      const somaInc = somarIncidencias({
        qtdAvisados: avisados,
        qtdRetornos: retornos,
        qtdEndInsuficiente: endInsuf,
        qtdRecusados: recusados,
        qtdDescMorada: descMorada
      });

      const qtdEntregues = calcularEntregues(totalObjetos, somaInc);
      const taxaEficiencia = calcularEficiencia(qtdEntregues, totalRecolhas, totalObjetos);
      const kmPercorridos = calcularKmPercorridos(registo.kmInicial, finalKm);

      // Atualização no banco de dados
      const registoFechado = await prisma.registoDiario.update({
        where: { id: registo.id },
        data: {
          status: 'fechado',
          kmFinal: finalKm,
          qtdObjetos: totalObjetos,
          qtdRecolhas: totalRecolhas,
          qtdAvisados: avisados,
          qtdRetornos: retornos,
          qtdEndInsuficiente: endInsuf,
          qtdRecusados: recusados,
          qtdDescMorada: descMorada,
          qtdEntregues,
          taxaEficiencia,
          kmPercorridos,
          dataHoraFecho: new Date()
        }
      });

      return res.json({
        status: 'sucesso',
        mensagem: 'Turno encerrado e métricas calculadas com sucesso!',
        dados: formatarRegisto(registoFechado)
      });
    } catch (error) {
      console.error('[ERRO FECHO TURNO]', error);
      return res.status(500).json({
        status: 'erro',
        mensagem: 'Ocorreu um erro interno ao processar o fecho de turno.'
      });
    }
  }

  /**
   * Listagem de Histórico de Registos Diários
   * GET /api/registos
   */
  static async listarRegistos(req, res) {
    try {
      const usuarioSessao = req.session.usuario;
      const { usuarioId, status, dataInicio, dataFim, limit = 50, page = 1 } = req.query;

      const where = {};

      // Isolamento por perfil: Operador vê apenas os seus próprios registos
      if (usuarioSessao.perfil === 'operador') {
        where.usuarioId = BigInt(usuarioSessao.id);
      } else if (usuarioId) {
        // Administrador filtrando por colaborador específico
        where.usuarioId = BigInt(usuarioId);
      }

      if (status && ['aberto', 'fechado'].includes(status)) {
        where.status = status;
      }

      if (dataInicio || dataFim) {
        where.dataRegisto = {};
        if (dataInicio) where.dataRegisto.gte = normalizarData(dataInicio);
        if (dataFim) where.dataRegisto.lte = normalizarData(dataFim);
      }

      const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
      const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * take;

      const [total, registos] = await Promise.all([
        prisma.registoDiario.count({ where }),
        prisma.registoDiario.findMany({
          where,
          take,
          skip,
          orderBy: [
            { dataRegisto: 'desc' },
            { id: 'desc' }
          ],
          include: {
            usuario: {
              select: {
                id: true,
                nomeCompleto: true,
                numeroSc: true,
                email: true
              }
            }
          }
        })
      ]);

      return res.json({
        status: 'sucesso',
        dados: registos.map(formatarRegisto),
        paginacao: {
          total,
          pagina: parseInt(page, 10) || 1,
          limite: take,
          totalPaginas: Math.ceil(total / take)
        }
      });
    } catch (error) {
      console.error('[ERRO LISTAR REGISTOS]', error);
      return res.status(500).json({
        status: 'erro',
        mensagem: 'Falha ao carregar lista de registos diários.'
      });
    }
  }

  /**
   * Obter detalhes de um registo por ID (com histórico de auditoria)
   * GET /api/registos/:id
   */
  static async obterPorId(req, res) {
    try {
      const { id } = req.params;
      const usuarioSessao = req.session.usuario;

      const registo = await prisma.registoDiario.findUnique({
        where: { id: BigInt(id) },
        include: {
          usuario: {
            select: {
              id: true,
              nomeCompleto: true,
              numeroSc: true,
              email: true,
              telemovel: true
            }
          },
          auditorias: {
            orderBy: { dataHoraAlteracao: 'desc' },
            include: {
              usuarioAlteracao: {
                select: {
                  id: true,
                  nomeCompleto: true,
                  numeroSc: true
                }
              }
            }
          }
        }
      });

      if (!registo) {
        return res.status(404).json({
          status: 'erro',
          mensagem: 'Registo diário não encontrado.'
        });
      }

      // Validação de acesso RBAC
      if (usuarioSessao.perfil === 'operador' && registo.usuarioId.toString() !== usuarioSessao.id.toString()) {
        return res.status(403).json({
          status: 'erro',
          mensagem: 'Acesso negado aos dados de outro colaborador.'
        });
      }

      return res.json({
        status: 'sucesso',
        dados: formatarRegisto(registo)
      });
    } catch (error) {
      console.error('[ERRO OBTER REGISTO POR ID]', error);
      return res.status(500).json({
        status: 'erro',
        mensagem: 'Falha ao obter detalhes do registo.'
      });
    }
  }

  /**
   * Edição de Registo Diário com Auditoria Obrigatória (JSONB)
   * PUT /api/registos/:id
   */
  static async editarRegisto(req, res) {
    try {
      const { id } = req.params;
      const usuarioIdSessao = BigInt(req.session.usuario.id);
      const perfilSessao = req.session.usuario.perfil;
      const {
        motivo,
        kmInicial,
        kmFinal,
        matriculaDia,
        giroDia,
        qtdObjetos,
        qtdRecolhas,
        qtdAvisados,
        qtdRetornos,
        qtdEndInsuficiente,
        qtdRecusados,
        qtdDescMorada,
        status
      } = req.body;

      // Motivo é estritamente obrigatório para auditoria
      if (!motivo || String(motivo).trim().length < 3) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'O motivo da alteração é obrigatório para efeitos de auditoria (mínimo 3 caracteres).'
        });
      }

      const registoExistente = await prisma.registoDiario.findUnique({
        where: { id: BigInt(id) }
      });

      if (!registoExistente) {
        return res.status(404).json({
          status: 'erro',
          mensagem: 'Registo diário não encontrado para edição.'
        });
      }

      // RBAC: Operador só edita os seus próprios; Admin edita qualquer um
      if (perfilSessao === 'operador' && registoExistente.usuarioId.toString() !== usuarioIdSessao.toString()) {
        return res.status(403).json({
          status: 'erro',
          mensagem: 'Não tem permissão para alterar o registo de outro colaborador.'
        });
      }

      // Preparação dos novos valores mesclados
      const novoKmInicial = kmInicial !== undefined ? parseInt(kmInicial, 10) : registoExistente.kmInicial;
      const novoKmFinal = kmFinal !== undefined 
        ? (kmFinal !== null ? parseInt(kmFinal, 10) : null) 
        : registoExistente.kmFinal;
      const novaMatricula = matriculaDia !== undefined ? String(matriculaDia).trim().toUpperCase() : registoExistente.matriculaDia;
      const novoGiro = giroDia !== undefined ? String(giroDia).trim().toUpperCase() : registoExistente.giroDia;
      const novoStatus = status !== undefined ? status : registoExistente.status;

      const novoQtdObjetos = qtdObjetos !== undefined ? parseInt(qtdObjetos, 10) : registoExistente.qtdObjetos;
      const novoQtdRecolhas = qtdRecolhas !== undefined ? parseInt(qtdRecolhas, 10) : registoExistente.qtdRecolhas;
      const novoAvisados = qtdAvisados !== undefined ? parseInt(qtdAvisados, 10) : registoExistente.qtdAvisados;
      const novoRetornos = qtdRetornos !== undefined ? parseInt(qtdRetornos, 10) : registoExistente.qtdRetornos;
      const novoEndInsuf = qtdEndInsuficiente !== undefined ? parseInt(qtdEndInsuficiente, 10) : registoExistente.qtdEndInsuficiente;
      const novoRecusados = qtdRecusados !== undefined ? parseInt(qtdRecusados, 10) : registoExistente.qtdRecusados;
      const novoDescMorada = qtdDescMorada !== undefined ? parseInt(qtdDescMorada, 10) : registoExistente.qtdDescMorada;

      let novoEntregues = registoExistente.qtdEntregues;
      let novaEficiencia = registoExistente.taxaEficiencia;
      let novoKmPercorridos = registoExistente.kmPercorridos;

      // Se o status for 'fechado', aplica validações matemáticas e recalcula métricas
      if (novoStatus === 'fechado' || novoKmFinal !== null) {
        const validacao = validarDadosFecho({
          kmInicial: novoKmInicial,
          kmFinal: novoKmFinal,
          qtdObjetos: novoQtdObjetos,
          qtdRecolhas: novoQtdRecolhas,
          qtdAvisados: novoAvisados,
          qtdRetornos: novoRetornos,
          qtdEndInsuficiente: novoEndInsuf,
          qtdRecusados: novoRecusados,
          qtdDescMorada: novoDescMorada
        });

        if (!validacao.valido) {
          return res.status(400).json({
            status: 'erro',
            mensagem: validacao.erros[0],
            erros: validacao.erros
          });
        }

        const somaInc = somarIncidencias({
          qtdAvisados: novoAvisados,
          qtdRetornos: novoRetornos,
          qtdEndInsuficiente: novoEndInsuf,
          qtdRecusados: novoRecusados,
          qtdDescMorada: novoDescMorada
        });

        novoEntregues = calcularEntregues(novoQtdObjetos, somaInc);
        novaEficiencia = calcularEficiencia(novoEntregues, novoQtdRecolhas, novoQtdObjetos);
        novoKmPercorridos = calcularKmPercorridos(novoKmInicial, novoKmFinal);
      }

      // Preparação dos snapshots para Auditoria JSONB
      const snapshotAntigo = {
        kmInicial: registoExistente.kmInicial,
        kmFinal: registoExistente.kmFinal,
        matriculaDia: registoExistente.matriculaDia,
        giroDia: registoExistente.giroDia,
        status: registoExistente.status,
        qtdObjetos: registoExistente.qtdObjetos,
        qtdRecolhas: registoExistente.qtdRecolhas,
        qtdAvisados: registoExistente.qtdAvisados,
        qtdRetornos: registoExistente.qtdRetornos,
        qtdEndInsuficiente: registoExistente.qtdEndInsuficiente,
        qtdRecusados: registoExistente.qtdRecusados,
        qtdDescMorada: registoExistente.qtdDescMorada,
        qtdEntregues: registoExistente.qtdEntregues,
        taxaEficiencia: registoExistente.taxaEficiencia ? Number(registoExistente.taxaEficiencia).toFixed(2) : '0.00',
        kmPercorridos: registoExistente.kmPercorridos
      };

      const snapshotNovo = {
        kmInicial: novoKmInicial,
        kmFinal: novoKmFinal,
        matriculaDia: novaMatricula,
        giroDia: novoGiro,
        status: novoStatus,
        qtdObjetos: novoQtdObjetos,
        qtdRecolhas: novoQtdRecolhas,
        qtdAvisados: novoAvisados,
        qtdRetornos: novoRetornos,
        qtdEndInsuficiente: novoEndInsuf,
        qtdRecusados: novoRecusados,
        qtdDescMorada: novoDescMorada,
        qtdEntregues: novoEntregues,
        taxaEficiencia: Number(novaEficiencia).toFixed(2),
        kmPercorridos: novoKmPercorridos
      };

      // Execução atômica no banco via Transação SQL
      const resultado = await prisma.$transaction(async (tx) => {
        // 1. Atualiza registos_diarios
        const atualizado = await tx.registoDiario.update({
          where: { id: registoExistente.id },
          data: {
            kmInicial: novoKmInicial,
            kmFinal: novoKmFinal,
            matriculaDia: novaMatricula,
            giroDia: novoGiro,
            status: novoStatus,
            qtdObjetos: novoQtdObjetos,
            qtdRecolhas: novoQtdRecolhas,
            qtdAvisados: novoAvisados,
            qtdRetornos: novoRetornos,
            qtdEndInsuficiente: novoEndInsuf,
            qtdRecusados: novoRecusados,
            qtdDescMorada: novoDescMorada,
            qtdEntregues: novoEntregues,
            taxaEficiencia: novaEficiencia,
            kmPercorridos: novoKmPercorridos,
            dataHoraFecho: novoStatus === 'fechado' && !registoExistente.dataHoraFecho ? new Date() : registoExistente.dataHoraFecho
          }
        });

        // 2. Insere na tabela auditoria_registos
        const auditoria = await tx.auditoriaRegisto.create({
          data: {
            registoDiarioId: registoExistente.id,
            usuarioAlteracaoId: usuarioIdSessao,
            valoresAntigos: snapshotAntigo,
            valoresNovos: snapshotNovo,
            motivo: String(motivo).trim()
          }
        });

        // 3. Regista no log de segurança
        await tx.logSeguranca.create({
          data: {
            tipoEvento: 'EDIT_REGISTO',
            usuarioId: usuarioIdSessao,
            ipOrigem: req.ip || req.connection.remoteAddress || '127.0.0.1',
            detalhes: `Edição no registo #${registoExistente.id}. Motivo: ${motivo.trim()}`
          }
        });

        return { atualizado, auditoria };
      });

      return res.json({
        status: 'sucesso',
        mensagem: 'Registo diário atualizado e auditoria gravada com sucesso!',
        dados: formatarRegisto(resultado.atualizado),
        auditoriaId: resultado.auditoria.id.toString()
      });
    } catch (error) {
      console.error('[ERRO EDITAR REGISTO]', error);
      return res.status(500).json({
        status: 'erro',
        mensagem: 'Ocorreu um erro interno ao atualizar o registo diário com auditoria.'
      });
    }
  }
}

module.exports = RegistoDiarioController;
