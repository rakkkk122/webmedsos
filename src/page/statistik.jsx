import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../style/Dashboard.css";
import logo from "../assets/logo.png";
import bumn from "../assets/BUMN.png";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function Statistik() {
  const [isNavbarActive, setIsNavbarActive] = useState(false);
  const [username, setUsername] = useState("");
  const [postsPerMonth, setPostsPerMonth] = useState([]);
  const [postClicks, setPostClicks] = useState([]); // data post_clicks
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [chartType, setChartType] = useState("post"); // 'post' | 'clicks'

  const tags = [
    "hiburan",
    "obrolan",
    "kesehatan",
    "travel",
    "kuliner",
    "olahraga",
  ];
  const tagColors = {
    hiburan: "#FF6384",
    obrolan: "#36A2EB",
    kesehatan: "#FFCE56",
    travel: "#4BC0C0",
    kuliner: "#9966FF",
    olahraga: "#FF9F40",
  };
  const tagDescriptions = {
    hiburan: "Postingan tentang hiburan",
    obrolan: "Postingan diskusi/obrolan",
    kesehatan: "Postingan kesehatan",
    travel: "Postingan perjalanan/wisata",
    kuliner: "Postingan makanan/minuman",
    olahraga: "Postingan olahraga",
  };

  const handleToggle = (isActive) => {
    setIsNavbarActive(isActive);
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      alert("Login session expired. Please login again.");
      window.location.href = "/login";
    }
  }, []);

  // Fetch data post per bulan per tag
  useEffect(() => {
    if (chartType === "post") {
      setLoading(true);
      axios
        // .get("http://localhost:5000/api/posts-per-month-by-tag")
         .get("http:///85.209.163.237:5000/api/posts-per-month-by-tag")
        .then((res) => {
          setPostsPerMonth(res.data || []);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          alert("Gagal mengambil data statistik post per bulan per tag");
        });
    }
  }, [chartType]);

  // Fetch data post_clicks
  useEffect(() => {
    if (chartType === "clicks") {
      setLoading(true);
      axios
        // .get("http://localhost:5000/api/post_clicks2")
        .get("http:///85.209.163.237:5000/api/post_clicks2")
        .then((res) => {
          setPostClicks(res.data || []);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          alert("Gagal mengambil data statistik post_clicks");
        });
    }
  }, [chartType]);

  // Transform data: { month, hiburan, obrolan, ... }
  let dataByMonth = {};
  if (chartType === "post") {
    postsPerMonth.forEach((item) => {
      if (!dataByMonth[item.month]) {
        dataByMonth[item.month] = { month: item.month };
        tags.forEach((tag) => (dataByMonth[item.month][tag] = 0));
      }
      dataByMonth[item.month][item.tags] = item.count;
    });
  } else if (chartType === "clicks") {
    // Proses postClicks menjadi {month, hiburan, obrolan, ...}
    postClicks.forEach((item) => {
      if (!item.tags || !item.click_time) return;
      const month = new Date(item.click_time).toISOString().slice(0, 7); // yyyy-MM
      if (!dataByMonth[month]) {
        dataByMonth[month] = { month };
        tags.forEach((tag) => (dataByMonth[month][tag] = 0));
      }
      if (tags.includes(item.tags)) {
        dataByMonth[month][item.tags] += 1;
      }
    });
  }
  const chartData = Object.values(dataByMonth).sort((a, b) => a.month.localeCompare(b.month));

  // Dapatkan daftar bulan unik (untuk filter)
  const monthOptions = Object.keys(dataByMonth).sort();

  // Filter data sesuai bulan yang dipilih
  const filteredChartData =
    selectedMonth === "all"
      ? chartData
      : chartData.filter((row) => row.month === selectedMonth);

  // Hitung persentase per tag untuk bulan yang dipilih
  function getTagPercentages(data) {
    // data: array of {month, hiburan, obrolan, ...}
    const result = [];
    data.forEach((row) => {
      const total = tags.reduce((sum, tag) => sum + (row[tag] || 0), 0);
      const percentages = {};
      tags.forEach((tag) => {
        percentages[tag] = total ? ((row[tag] || 0) / total * 100).toFixed(1) : 0;
      });
      result.push({ month: row.month, ...percentages });
    });
    return result;
  }
  const tagPercentages = getTagPercentages(filteredChartData);

  // Fungsi download laporan
  const handleDownload = async () => {
    const input = document.getElementById("laporan-statistik");
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height + 200],
    });

    pdf.text("Laporan Statistik Post Per Bulan", 30, 30);
    if (selectedMonth === "all") {
      pdf.text("Periode: Semua Bulan", 30, 50);
    } else {
      pdf.text(`Periode: Bulan ${selectedMonth}`, 30, 50);
    }
    pdf.addImage(imgData, "PNG", 30, 60, canvas.width * 0.9, canvas.height * 0.9);

    // Tambahkan persentase tabel
    let y = canvas.height * 0.9 + 80;
    pdf.text("Persentase Postingan per Tag:", 30, y);
    y += 20;
    tagPercentages.forEach((row) => {
      let line = `Bulan ${row.month}: `;
      line += tags
        .map((tag) => `${tag.charAt(0).toUpperCase() + tag.slice(1)}: ${row[tag]}%`)
        .join(" | ");
      pdf.text(line, 30, y);
      y += 18;
    });

    pdf.save(
      `laporan-statistik-${
        selectedMonth === "all" ? "semua-bulan" : selectedMonth
      }.pdf`
    );
  };

  function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
      // Urutkan payload dari nilai tertinggi ke terendah
      const sortedPayload = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0));
      // Hitung total semua post pada bulan itu
      const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
      return (
        <div style={{ background: '#fff', border: '1px solid #ccc', padding: 10, borderRadius: 6 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Bulan: {label}</div>
          {sortedPayload.map((entry) => (
            <div key={entry.dataKey} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </div>
          ))}
          <div style={{ marginTop: 6, fontWeight: 'bold' }}>Total: {total}</div>
        </div>
      );
    }
    return null;
  }

  function PostsPerMonthChart({ data }) {
    // Helper untuk label persen
    const renderPercentLabel = (props) => {
      const { x, y, width, value, dataKey, index } = props;
      // Hitung total post pada bulan itu
      const total = tags.reduce((sum, tag) => sum + (data[index][tag] || 0), 0);
      if (!total || !value) return null;
      const percent = ((value / total) * 100).toFixed(1);
      return (
        <text
          x={x + width / 2}
          y={y - 6}
          fill="#222"
          fontSize={12}
          textAnchor="middle"
          fontWeight="bold"
        >
          {percent}%
        </text>
      );
    };

    // Hitung nilai maksimum dari semua tag di semua bulan
    let maxValue = 0;
    data.forEach(row => {
      tags.forEach(tag => {
        if (row[tag] > maxValue) maxValue = row[tag];
      });
    });
    const yMax = maxValue + 2;

    return (
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <ResponsiveContainer width="70%" height={400}>
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis domain={[0, yMax]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {tags.map((tag) => (
              <Bar
                key={tag}
                dataKey={tag}
                fill={tagColors[tag]}
                name={tag.charAt(0).toUpperCase() + tag.slice(1)}
              >
                <LabelList dataKey={tag} content={renderPercentLabel} />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
        <div style={{ marginLeft: 32 }}>
          <h4>Keterangan Tag:</h4>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {tags.map((tag) => (
              <li key={tag} style={{ marginBottom: 8 }}>
                <span style={{ color: tagColors[tag], fontWeight: "bold", marginRight: 8 }}>■</span>
                <span style={{ fontWeight: "bold" }}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</span>: {tagDescriptions[tag]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`layout-dashboard ${isNavbarActive ? "navbar-active" : ""}`}>
        <div className={`navbar-dashboard ${isNavbarActive ? 'active' : ''}`}>
          <Navbar onToggle={handleToggle} />
        </div>
        <div className={`dashboard-content ${isNavbarActive ? "shifted" : ""}`}>
          <div className="header-wrapper">
            <img src={bumn} alt="BUMN Logo" className="header-logo-left" />
            <h1 className="header-title">Statistik</h1>
            <img src={logo} alt="Company Logo" className="header-logo-right" />
          </div>
          <br /><br />
          <h1 style={{ color: "#002966", paddingLeft: "20px" }}>
            Hallo Admin, {username}
          </h1>
          <br />
          <p style={{ color: "#0C718F", paddingLeft: "20px" }}>
            Ini adalah halaman untuk melihat statistik post per bulan berdasarkan tag. Anda dapat melihat grafik 
            yang menampilkan jumlah post yang dibuat setiap bulannya untuk setiap kategori tag.
          </p>
          <div className="dashboard-layout">
            <div style={{ marginBottom: 0 }}>
              <label htmlFor="chartType" style={{ marginRight: 8 }}>Tipe Grafik:</label>
              <select
                id="chartType"
                value={chartType}
                onChange={e => setChartType(e.target.value)}
                style={{ marginRight: 16 }}
              >
                <option value="post">Statistik Post</option>
                <option value="clicks">Statistik Post Clicks</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
              <label htmlFor="bulan" style={{ marginRight: 8 }}>Filter Bulan:</label>
              <select
                id="bulan"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ marginRight: 16 }}
              >
                <option value="all">Semua Bulan</option>
                {Object.keys(dataByMonth).sort().map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <button onClick={handleDownload} style={{ padding: "6px 16px", background: "#0C718F", color: "#fff", border: "none", borderRadius: 4 }}>
                Download Laporan
              </button>
            </div>
           
          </div>
          <div className="cards-container" id="laporan-statistik" style={{ marginTop: 80, width: '100%' }}>
              {loading ? (
                <div style={{
                  display: 'absolute',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: '500px',
                  color: '#888'
                }}>
                  Memuat grafik...
                </div>
              ) : (
                <PostsPerMonthChart data={selectedMonth === "all" ? chartData : chartData.filter(row => row.month === selectedMonth)} />
              )}
            </div>
        </div>
        
      </div>
    </>
  );
}

export default Statistik;
