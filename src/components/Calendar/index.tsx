import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import axios from "axios";

dayjs.locale("pt-br");

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface Feriado {
  date: string;
  name: string;
  type: string;
}

const Calendar = () => {
  const currentYear = dayjs().year();
  const [feriados, setFeriados] = useState<Feriado[]>([]);

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
      const feriado = feriados.find((f) =>
        dayjs(f.date).isSame(date, "day")
      );

      days.push(
        <div
          key={`day-${monthIndex}-${day}`}
          className={`text-center p-2 rounded border 
            ${feriado ? "bg-red-100 text-red-800 font-semibold" : "hover:bg-blue-500 hover:text-white"} 
            cursor-pointer`}
          title={feriado?.name || ""}
        >
          <div>{day}</div>
          {feriado && (
            <div className="text-xs mt-1 hover:text-white"></div>
          )}
        </div>
      );
    }

    return (
      <div key={monthIndex} className="bg-white shadow rounded p-4 scale-100 hover:scale-105 transition-transform duration-200">
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
    <div className="flex flex-wrap justify-center gap-6 p-6 bg-gray-100">
      {[...Array(12).keys()].map((monthIndex) => renderMonth(monthIndex))}
    </div>
  );
};

export default Calendar;
