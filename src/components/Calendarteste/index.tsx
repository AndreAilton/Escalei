import React, { useState } from "react";

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const turnos = ["Noite", "Tarde", "Manhã", "Teste"];
const trabalhoInicio = new Date(2025, 0, 1); // 01/01/2025

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// Encontra o primeiro domingo no ou após a data de início
function getFirstSundayFrom(date: Date) {
  const d = new Date(date);
  while (d.getDay() !== 0) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

// Encontra a primeira segunda-feira após uma data dada
function getNextMondayFrom(date: Date) {
  const d = new Date(date);
  do {
    d.setDate(d.getDate() + 1);
  } while (d.getDay() !== 1);
  return d;
}

// Calcula o número de semanas completas desde o início do ciclo (segunda-feira)
function weeksSince(startDate: Date, date: Date) {
  const diff = date.getTime() - startDate.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.floor(diff / oneWeek);
}

function getTurnoOuFolga(date: Date): string {
  if (date.getDay() === 0) {
    return "Folga";
  }

  // Determinar início do ciclo: primeira segunda-feira após o primeiro domingo a partir do início
  const primeiroDomingo = getFirstSundayFrom(trabalhoInicio);
  const inicioCiclo = getNextMondayFrom(primeiroDomingo);

  if (date < inicioCiclo) {
    // Antes do ciclo começar, não trabalha (ou pode retornar "Folga" ou vazio)
    return "-";
  }

  // Calcular quantas semanas completas se passaram desde o início do ciclo
  const semanasPassadas = weeksSince(inicioCiclo, date);

  const turnoIndex = semanasPassadas % turnos.length;
  return turnos[turnoIndex];
}

export const Calendar: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const calendarDays = [];

  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {"<"}
        </button>
        <h2 className="text-lg font-semibold">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button
          onClick={nextMonth}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {">"}
        </button>
      </div>

      <div className="grid grid-cols-7 text-center font-medium text-gray-700 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarDays.map((day, idx) => {
          if (!day) return <div key={idx} />;

          const date = new Date(currentYear, currentMonth, day);
          const turno = getTurnoOuFolga(date);

          let bgClass = "";
          let textClass = "text-gray-900";

          if (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
          ) {
            bgClass = "bg-blue-400 text-white font-bold";
          } else if (turno === "Folga" || turno === "-") {
            bgClass = "bg-gray-300";
            textClass = "text-gray-600";
          } else if (turno === "Noite") {
            bgClass = "bg-purple-400 text-white";
          } else if (turno === "Tarde") {
            bgClass = "bg-yellow-400 text-black";
          } else if (turno === "Manhã") {
            bgClass = "bg-green-400 text-white";
          }

          return (
            <div
              key={idx}
              className={`py-2 rounded cursor-default ${bgClass} ${textClass} flex flex-col items-center justify-center`}
              title={turno === "-" ? "Sem turno definido" : turno}
            >
              <span>{day}</span>
              <small className="text-xs mt-1 font-semibold">{turno}</small>
            </div>
          );
        })}
      </div>
    </div>
  );
};



export default Calendar;