import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PostsPerMonthChart({ data, onMonthChange, selectedMonth }) {
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];
  const months = safeData.map((item) => item.month);
  const counts = safeData.map((item) => item.count);

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px #eee", marginTop: 32 }}>
      <h2 style={{ color: "#002966" }}>Grafik Post per Bulan</h2>
      <Line
        data={{
          labels: months.reverse(),
          datasets: [
            {
              label: "Jumlah Post",
              data: counts.reverse(),
              fill: false,
              borderColor: "#0C718F",
              backgroundColor: "#0C718F",
              tension: 0.2,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: false,
            },
          },
          scales: {
            x: {
              title: { display: true, text: "Bulan" },
            },
            y: {
              title: { display: true, text: "Jumlah Post" },
              beginAtZero: true,
              precision: 0,
            },
          },
        }}
      />
      <div style={{ marginTop: 24 }}>
        <label htmlFor="monthSelect">Pilih Bulan: </label>
        <select
          id="monthSelect"
          value={selectedMonth || ""}
          onChange={(e) => onMonthChange(e.target.value)}
        >
          <option value="">Semua Bulan</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
