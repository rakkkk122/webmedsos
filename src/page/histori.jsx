import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import "../style/News2.css";
import logo from "../assets/logo.png";
import bumn from "../assets/BUMN.png";
import "@fortawesome/fontawesome-free/css/all.min.css";

function Histori() {
    const [isNavbarActive, setIsNavbarActive] = useState(false);
    const [clickData, setClickData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortOrder, setSortOrder] = useState("asc");

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const sortedClickData = [...clickData].sort((a, b) => {
        const tA = a.click_time ? new Date(a.click_time).getTime() : 0;
        const tB = b.click_time ? new Date(b.click_time).getTime() : 0;
        return sortOrder === "asc" ? tA - tB : tB - tA;
    });
    const currentItems = sortedClickData.slice(indexOfFirstItem, indexOfLastItem);
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(clickData.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleToggle = (isActive) => {
        setIsNavbarActive(isActive);
    };

    const handleSortClickTime = () => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    };

    useEffect(() => {
        const fetchClicks = async () => {
            setLoading(true);
            try {
                //const response = await fetch("http://localhost:5000/api/post_clicks2");
                const response = await fetch("http://85.209.163.237:5000/api/post_clicks2");
                const data = await response.json();
                setClickData(data);
            } catch (error) {
                console.error("Error fetching post_clicks:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClicks();
    }, []);

    // Tambahkan memoized map untuk jumlah klik per (ktpa, post_id, tanggal)
    const clickCountMap = useMemo(() => {
        const map = {};
        for (const item of clickData) {
            const dateStr = item.click_time ? new Date(item.click_time).toISOString().slice(0, 10) : "";
            const key = `${item.post_id}__${item.content}__${dateStr}`;
            map[key] = (map[key] || 0) + 1;
        }
        return map;
    }, [clickData]);

    return (
        <>
               <div className={`layout-news ${isNavbarActive ? "navbar-active" : ""}`}>
                <div className={`navbar-news ${isNavbarActive ? "active" : ""}`}>
                    <Navbar onToggle={handleToggle} />
                </div>
                <div className={`news-content ${isNavbarActive ? "shifted" : ""}`}>
                    <div className="header-news">
                        <img src={bumn} alt="BUMN Logo" className="header-logo-left" />
                        <h1 className="header-title">Manajemen Post</h1>
                        <img src={logo} alt="Company Logo" className="header-logo-right" />
                    </div>
                    <br />
                    <p style={{ color: "#0C718F", paddingLeft: "20px" }}>
                        Halaman ini menampilkan histori klik post oleh pengguna.
                    </p>
                    <div style={{ marginBottom: 16, paddingLeft: 20 }}>
                        <label htmlFor="itemsPerPageSelect" style={{ marginRight: 8 }}>Tampilkan</label>
                        <select
                            id="itemsPerPageSelect"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            style={{ marginRight: 8 }}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span>histori per halaman</span>
                    </div>
                    <div className="card-data-news" style={{ paddingLeft: 20, paddingRight: 20 }}>
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid #002966" }}>
                                        <th>No</th>
                                        <th>KTPA</th>
                                        <th>Nama</th>
                                        <th>Post ID</th>
                                        <th>Tags</th>
                                        <th>Content</th>
                                        <th
                                            style={{ cursor: "pointer", userSelect: "none" }}
                                            onClick={handleSortClickTime}
                                            title="Urutkan berdasarkan waktu klik"
                                        >
                                            Waktu Klik {" "}
                                            {sortOrder === "asc" ? (
                                                <span style={{ fontSize: 12 }}>▲</span>
                                            ) : (
                                                <span style={{ fontSize: 12 }}>▼</span>
                                            )}
                                        </th>
                                        <th>Klik</th> {/* Kolom baru */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => {
                                        const dateStr = item.click_time ? new Date(item.click_time).toISOString().slice(0, 10) : "";
                                        const clickKey = `${item.post_id}__${item.content}__${dateStr}`;
                                        return (
                                            <tr key={item.id || index}>
                                                <td>{indexOfFirstItem + index + 1}</td>
                                                <td>{item.ktpa}</td>
                                                <td>{item.nama}</td>
                                                <td>{item.post_id}</td>
                                                <td>{item.tags}</td>
                                                <td>{item.content ? item.content.substring(0, 80) + (item.content.length > 80 ? "..." : "") : ""}</td>
                                                <td>{item.click_time ? new Date(item.click_time).toLocaleString() : "-"}</td>
                                                <td>
                                                    {clickCountMap[clickKey]}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                        <div className="pagination">
                            {pageNumbers.map((number) => (
                                <button
                                    key={number}
                                    onClick={() => paginate(number)}
                                    className={`page-btn ${currentPage === number ? "active" : ""}`}
                                    style={{
                                        margin: "0 5px",
                                        padding: "5px 10px",
                                        border: "1px solid #002966",
                                        borderRadius: "5px",
                                        backgroundColor: currentPage === number ? "#002966" : "#fff",
                                        color: currentPage === number ? "#fff" : "#002966",
                                        cursor: "pointer",
                                    }}
                                >
                                    {number}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Histori;
