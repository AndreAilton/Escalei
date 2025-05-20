const Turnos = ["Noite", "Tarde", "Manhã"];
const DiasTrabalhados = 6;
const Folgas = 1;
const Datainicio = new Date("2025-01-06");

function gerarEscalaAnual() {
  const escala = [];
  let dataAtual = new Date(Datainicio);
  const ano = Datainicio.getFullYear();

  // Função auxiliar para formatar a data em YYYY-MM-DD
  function formatarData(d) {
    return d.toISOString().split('T')[0];
  }

  // Calcula o último dia do ano
  const ultimoDiaAno = new Date(ano, 11, 31);

  // Índice do turno atual (vai de 0 a 2)
  let indiceTurno = 0;

  while (dataAtual <= ultimoDiaAno) {
    // 6 dias trabalhando com o turno atual
    for (let i = 0; i < DiasTrabalhados; i++) {
      if (dataAtual > ultimoDiaAno) break;
      escala.push({
        data: formatarData(dataAtual),
        turno: Turnos[indiceTurno],
      });
      dataAtual.setDate(dataAtual.getDate() + 1);
    }

    // 1 dia de folga
    for (let j = 0; j < Folgas; j++) {
      if (dataAtual > ultimoDiaAno) break;
      escala.push({
        data: formatarData(dataAtual),
        turno: "Folga",
      });
      dataAtual.setDate(dataAtual.getDate() + 1);
    }

    // Vai para o próximo turno (revezamento)
    indiceTurno = (indiceTurno + 1) % Turnos.length;
  }

  return escala;
}

const escalaAnual = gerarEscalaAnual();

// Exemplo: mostrar os primeiros 20 dias da escala para verificar
console.log(escalaAnual);
