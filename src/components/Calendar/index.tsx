import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import axios from "axios";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

dayjs.locale("pt-br");

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface Feriado {
  date: string;
  name: string;
  type: string;
}

interface Escala {
  data: string;
  turno: string;
}

function gerarEscalaAnual(
  Turnos: string[],
  DiasTrabalhados: number,
  Folgas: number,
  Datainicio: Date
): Escala[] {
  const escala: Escala[] = [];
  if (!Turnos.length || DiasTrabalhados < 1 || isNaN(Datainicio.getTime())) {
    return escala;
  }
  let dataAtual = new Date(Datainicio);
  const ano = Datainicio.getFullYear();

  function formatarData(d: Date) {
    return d.toISOString().split("T")[0];
  }

  const ultimoDiaAno = new Date(ano, 11, 31);
  let indiceTurno = 0;
  let maxIteracoes = 4000; // proteção extra

  while (dataAtual <= ultimoDiaAno && maxIteracoes-- > 0) {
    for (let i = 0; i < DiasTrabalhados; i++) {
      if (dataAtual > ultimoDiaAno) break;
      escala.push({
        data: formatarData(dataAtual),
        turno: Turnos[indiceTurno],
      });
      dataAtual.setDate(dataAtual.getDate() + 1);
    }
    for (let j = 0; j < Folgas; j++) {
      if (dataAtual > ultimoDiaAno) break;
      escala.push({
        data: formatarData(dataAtual),
        turno: "Folga",
      });
      dataAtual.setDate(dataAtual.getDate() + 1);
    }
    indiceTurno = (indiceTurno + 1) % Turnos.length;
  }
  return escala;
}

const turnoColors = [
  { bg: "#b3c7e6", text: "#222" },
  { bg: "#deaf3c", text: "#222" },
  { bg: "#d2d3d6", text: "#333" },
  { bg: "#a3e6b3", text: "#222" },
  { bg: "#e6b3c7", text: "#222" },
];

const Calendar = () => {
  const currentYear = dayjs().year();
  const [feriados, setFeriados] = useState<Feriado[]>([]);

  // Estado dos turnos como string[]
  const [turnos, setTurnos] = useState<string[]>([]);
  const [novoTurno, setNovoTurno] = useState<string>("");
  const [diasTrabalhados, setDiasTrabalhados] = useState<number>(6);
  const [folgas, setFolgas] = useState<number>(2);
  const [datainicio, setDatainicio] = useState<string>("2025-01-01");
  const [escalaAnual, setEscalaAnual] = useState<Escala[]>([]);
  const [gerar, setGerar] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5, // só começa a arrastar após mover 5px
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100,
      tolerance: 5,
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  useEffect(() => {
    const fetchFeriados = async () => {
      try {
        const res = await axios.get<Feriado[]>(
          `https://brasilapi.com.br/api/feriados/v1/${currentYear}`
        );
        setFeriados(res.data);
      } catch (err) {
        console.error("Erro ao buscar feriados:", err);
      }
    };
    fetchFeriados();
  }, [currentYear]);

  useEffect(() => {
    if (gerar) {
      if (!turnos.length) {
        setErro("Adicione pelo menos um turno para gerar o calendário.");
        setGerar(false);
        setEscalaAnual([]);
        return;
      }
      const dataInicioObj = dayjs(datainicio, "YYYY-MM-DD").toDate();
      setEscalaAnual(
        gerarEscalaAnual(turnos, diasTrabalhados, folgas, dataInicioObj)
      );
      setErro(null);
      setGerar(false);
    }
  }, [gerar]);

  const handleAddTurno = () => {
    const t = novoTurno.trim();
    if (!t) {
      setErro("Digite um nome para o turno.");
      return;
    }
    if (turnos.includes(t)) {
      setErro("Turno já adicionado.");
      return;
    }
    setTurnos([...turnos, t]);
    setNovoTurno("");
    setErro(null);
  };

  // Função para remover pelo índice
  const handleRemoveTurno = (idx: number) => {
    const novosTurnos = turnos.filter((_, i) => i !== idx);
    setTurnos(novosTurnos);
    if (!novosTurnos.length) {
      setEscalaAnual([]);
      setErro("Adicione pelo menos um turno para gerar o calendário.");
    } else {
      const dataInicioObj = dayjs(datainicio, "YYYY-MM-DD").toDate();
      setEscalaAnual(
        gerarEscalaAnual(novosTurnos, diasTrabalhados, folgas, dataInicioObj)
      );
      setErro(null);
    }
  };

  function SortableTurno({ turno, idx, onRemove, color }: any) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: idx });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      background: color.bg,
      color: color.text,
      cursor: "grab",
      userSelect: "none",
    };

    return (
      <span
        ref={setNodeRef}
        style={style as React.CSSProperties}
        {...attributes}
        {...listeners}
        className="flex items-center px-2 py-1 rounded text-xs select-none"
      >
        {turno}
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(idx);
          }}
          className="ml-2 text-red-600 font-bold hover:text-red-800"
          title="Remover"
        >
          ×
        </button>
      </span>
    );
  }

  // Drag-and-drop usando índices
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = active.id;
    const newIndex = over.id;
    const novosTurnos = arrayMove(turnos, oldIndex, newIndex);
    setTurnos(novosTurnos);

    const dataInicioObj = dayjs(datainicio, "YYYY-MM-DD").toDate();
    setEscalaAnual(
      gerarEscalaAnual(novosTurnos, diasTrabalhados, folgas, dataInicioObj)
    );
  };

  const renderMonth = (monthIndex: number) => {
    const dateBase = dayjs(`${currentYear}-${monthIndex + 1}-01`);
    const startOfMonth = dateBase.startOf("month");
    const endOfMonth = dateBase.endOf("month");
    const startDay = startOfMonth.day();
    const totalDays = endOfMonth.date();
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${monthIndex}-${i}`} />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = dateBase.date(day);
      const feriado = feriados.find((f) => dayjs(f.date).isSame(date, "day"));
      const escalaDia = escalaAnual.find((e) =>
        dayjs(e.data).isSame(date, "day")
      );

      let styleObj: React.CSSProperties = {};
      let isTurnoValido = false;

      if (escalaDia && escalaDia.turno !== "Folga") {
        const idx = turnos.findIndex(
          (t) => t.toLowerCase() === escalaDia.turno.toLowerCase()
        );
        if (idx !== -1) {
          const color = turnoColors[idx % turnoColors.length];
          styleObj = { background: color.bg, color: color.text };
          isTurnoValido = true;
        }
      }

      days.push(
        <div
          key={`day-${monthIndex}-${day}`}
          className={`text-center p-2 rounded border ${
            feriado
              ? "bg-red-100 text-red-800 font-semibold"
              : escalaDia?.turno === "Folga"
              ? "bg-green-100 text-green-800"
              : ""
          } cursor-pointer`}
          style={
            feriado
              ? undefined
              : escalaDia && escalaDia.turno !== "Folga" && isTurnoValido
              ? styleObj
              : undefined
          }
          title={feriado?.name || ""}
        >
          <div>{day}</div>
          {escalaDia && <div className="text-xs mt-1">{escalaDia.turno}</div>}
        </div>
      );
    }

    return (
      <div
        key={monthIndex}
        className="bg-white shadow rounded p-4 scale-100 hover:scale-105 transition-transform duration-200"
      >
        <h2 className="text-lg font-bold mb-2 text-center capitalize">
          {dateBase.format("MMMM")}
        </h2>
        <div className="grid grid-cols-7 gap-2 text-sm text-gray-700">
          {daysOfWeek.map((day) => (
            <div key={`header-${day}`} className="text-center font-medium">
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-2">
        Calendário Escala do Ano
      </h1>
      {erro && (
        <div className="bg-red-200 text-red-800 px-4 py-2 rounded mb-4 text-center font-semibold">
          {erro}
        </div>
      )}
      <form
        className="flex flex-wrap justify-center gap-4 mb-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            Adicionar Turno:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={novoTurno}
              onChange={(e) => setNovoTurno(e.target.value)}
              className="border rounded px-2 py-1"
              placeholder="Nome do turno"
            />
            <button
              type="button"
              onClick={handleAddTurno}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Adicionar
            </button>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={turnos.map((_, idx) => idx)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex flex-wrap gap-2 mt-2">
                {turnos.map((turno, idx) => (
                  <SortableTurno
                    key={turno + idx}
                    turno={turno}
                    idx={idx}
                    onRemove={handleRemoveTurno}
                    color={turnoColors[idx % turnoColors.length]}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Dias Trabalhados:
          </label>
          <input
            type="number"
            min={1}
            value={diasTrabalhados}
            onChange={(e) => setDiasTrabalhados(Number(e.target.value))}
            className="border rounded px-2 py-1 w-20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Folgas:</label>
          <input
            type="number"
            min={0}
            value={folgas}
            onChange={(e) => setFolgas(Number(e.target.value))}
            className="border rounded px-2 py-1 w-20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Data Início:</label>
          <input
            type="date"
            value={datainicio}
            onChange={(e) => setDatainicio(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setGerar(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Gerar Calendário
          </button>
        </div>
      </form>
      <div className="flex flex-wrap justify-center gap-6 p-6 bg-gray-100">
        {escalaAnual.length > 0 &&
          [...Array(12).keys()].map((monthIndex) => renderMonth(monthIndex))}
      </div>
    </div>
  );
};

export default Calendar;
