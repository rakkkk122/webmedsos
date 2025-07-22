import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../style/News2.css";
import logo from "../assets/logo.png";
import bumn from "../assets/BUMN.png";
import "@fortawesome/fontawesome-free/css/all.min.css";

function BM() {
    const [isNavbarActive, setIsNavbarActive] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortOrder, setSortOrder] = useState("desc");
    const [selectedUser, setSelectedUser] = useState("");
    const [users, setUsers] = useState([]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const sortedSearchResults = [...searchResults].sort((a, b) => {
        const tA = a.created_timestamp ? new Date(a.created_timestamp).getTime() : 0;
        const tB = b.created_timestamp ? new Date(b.created_timestamp).getTime() : 0;
        return sortOrder === "asc" ? tA - tB : tB - tA;
    });
    const currentItems = sortedSearchResults.slice(indexOfFirstItem, indexOfLastItem);
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(searchResults.length / itemsPerPage); i++) {
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

    const handleUserChange = (e) => {
        setSelectedUser(e.target.value);
        setCurrentPage(1);
    };

    const fetchUsers = async () => {
        try {
            //const response = await fetch("http://localhost:5000/api/search-results");
            const response = await fetch("http://85.209.163.237:5000/api/search-results");
            const data = await response.json();
            if (data.success && data.results) {
                const uniqueUsers = [...new Set(data.results.map(item => item.user_ktpa))];
                setUsers(uniqueUsers);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                //let url = "http://localhost:5000/api/search-results";
                let url = "http://85.209.163.237:5000/api/search-results";
                if (selectedUser) {
                    url += `?user_ktpa=${selectedUser}`;
                }
                const response = await fetch(url);
                const data = await response.json();
                if (data.success) {
                    setSearchResults(data.results || []);
                } else {
                    console.error("Error fetching search results:", data.message);
                    setSearchResults([]);
                }
            } catch (error) {
                console.error("Error fetching search results:", error);
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [selectedUser]);

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <>
            <div className={`layout-news ${isNavbarActive ? "navbar-active" : ""}`}>
                <div className={`navbar-news ${isNavbarActive ? "active" : ""}`}>
                    <Navbar onToggle={handleToggle} />
                </div>
                <div className={`news-content ${isNavbarActive ? "shifted" : ""}`}>
                    <div className="header-news">
                        <img src={bumn} alt="BUMN Logo" className="header-logo-left" />
                        <h1 className="header-title">Hasil Pencarian</h1>
                        <img src={logo} alt="Company Logo" className="header-logo-right" />
                    </div>
                    <br />
                    <p style={{ color: "#0C718F", paddingLeft: "20px" }}>
                        Halaman ini menampilkan hasil pencarian yang tersimpan di database dengan skor BM25.
                    </p>
                    
                    {/* Filter by User */}
                    <div style={{ marginBottom: 16, paddingLeft: 20 }}>
                        <label htmlFor="userSelect" style={{ marginRight: 8 }}>Filter User:</label>
                        <select
                            id="userSelect"
                            value={selectedUser}
                            onChange={handleUserChange}
                            style={{ marginRight: 16, padding: "4px 8px" }}
                        >
                            <option value="">Semua User</option>
                            {users.map((user) => (
                                <option key={user} value={user}>
                                    {user}
                                </option>
                            ))}
                        </select>
                        
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
                        <span>hasil per halaman</span>
                    </div>

                    <div className="card-data-news" style={{ paddingLeft: 20, paddingRight: 20 }}>
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid #002966" }}>
                                        <th>No</th>
                                        <th>User KTPA</th>
                                        <th>Query Pencarian</th>
                                        <th>Post ID</th>
                                        <th>Nama Author</th>
                                        <th>Content</th>
                                        <th>Skor BM25</th>
                                        <th>Jumlah Komentar</th>
                                        <th
                                            style={{ cursor: "pointer", userSelect: "none" }}
                                            onClick={handleSortClickTime}
                                            title="Urutkan berdasarkan waktu pencarian"
                                        >
                                            Waktu Pencarian {" "}
                                            {sortOrder === "asc" ? (
                                                <span style={{ fontSize: 12 }}>▲</span>
                                            ) : (
                                                <span style={{ fontSize: 12 }}>▼</span>
                                            )}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.id || index}>
                                            <td>{indexOfFirstItem + index + 1}</td>
                                            <td>{item.user_ktpa}</td>
                                            <td style={{ fontWeight: "bold", color: "#002966" }}>
                                                "{item.search_query}"
                                            </td>
                                            <td>{item.post_id}</td>
                                            <td>{item.nama}</td>
                                            <td>
                                                {item.content ? 
                                                    item.content.substring(0, 80) + (item.content.length > 80 ? "..." : "") 
                                                    : "-"
                                                }
                                            </td>
                                            <td style={{ 
                                                fontWeight: "bold", 
                                                color: item.score > 0.5 ? "#28a745" : 
                                                       item.score > 0.2 ? "#ffc107" : "#dc3545"
                                            }}>
                                                {item.score ? item.score.toFixed(4) : "0.0000"}
                                            </td>
                                            <td>{item.comment_count || 0}</td>
                                            <td>
                                                {item.created_timestamp ? 
                                                    new Date(item.created_timestamp).toLocaleString() 
                                                    : "-"
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        
                        {!loading && searchResults.length === 0 && (
                            <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                                Tidak ada hasil pencarian yang tersimpan.
                            </p>
                        )}

                        {pageNumbers.length > 1 && (
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
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default BM;
