import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../style/News.css";
import logo from "../assets/logo.png";
import bumn from "../assets/BUMN.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import imageCompression from 'browser-image-compression';

function News() {
    const [isNavbarActive, setIsNavbarActive] = useState(false); // Status navbar
    const [newsData, setNewsData] = useState([]); // Data berita
    const [filteredNews, setFilteredNews] = useState([]); // Data berita yang difilter
    const [searchTerm, setSearchTerm] = useState(""); // Kata kunci pencarian
    const [loading, setLoading] = useState(true); // Status loading
    const [isModalOpen, setIsModalOpen] = useState(false); // Status modal konfirmasi
    const [isAddNewsModalOpen, setIsAddNewsModalOpen] = useState(false); // Status modal tambah berita
    const [selectedNewsId, setSelectedNewsId] = useState(null); // ID berita yang akan dihapus
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); // Halaman saat ini
    const itemsPerPage = 5; // Jumlah data per halaman

    const indexOfLastItem = currentPage * itemsPerPage; // Indeks data terakhir
    const indexOfFirstItem = indexOfLastItem - itemsPerPage; // Indeks data pertama
    const currentItems = filteredNews.slice(indexOfFirstItem, indexOfLastItem); // Potong data
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const truncateText = (text, maxLength) => {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + "...";
        }
        return text;
    };

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredNews.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    // Form input state untuk berita baru
    const [newNews, setNewNews] = useState({
        title: "",
        description: "",
        date: "",
        image: null,
        author: "",
    });

    const [updatedNews, setUpdatedNews] = useState({
        id: null,
        title: "",
        description: "",
        date: "",
        image: null,
        author: "",
    });

    const openUpdateModal = (news) => {
        setUpdatedNews({
            id: news.id,
            title: news.title,
            description: news.description,
            date: news.date,
            image: null, // Gambar awal tidak ditampilkan
            author: news.author,
        });
        setIsUpdateModalOpen(true);
    };

    const closeUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setUpdatedNews({ id: null, title: "", description: "", date: "", image: null, author: "" });
    };


    // Fungsi untuk toggle Navbar
    const handleToggle = (isActive) => {
        setIsNavbarActive(isActive);
    };

    // Fetch data berita dari API
    const fetchNews = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://85.209.163.237:5000/api/news");
            const data = await response.json();
            setNewsData(data); // Set data ke state
            setFilteredNews(data); // Set data ke state yang difilter
        } catch (error) {
            console.error("Error fetching news:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk menangani perubahan input pencarian
    const handleSearchChange = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);

        // Filter data berdasarkan judul atau deskripsi
        const filtered = newsData.filter(
            (news) =>
                news.title.toLowerCase().includes(value) ||
                news.description.toLowerCase().includes(value)
        );
        setFilteredNews(filtered);
    };

    // Fungsi untuk membuka modal konfirmasi
    const openDeleteModal = (id) => {
        setSelectedNewsId(id);
        setIsModalOpen(true);
    };

    // Fungsi untuk menutup modal konfirmasi
    const closeDeleteModal = () => {
        setIsModalOpen(false);
        setSelectedNewsId(null);
    };

    // Fungsi untuk membuka modal tambah berita
    const openAddNewsModal = () => {
        setIsAddNewsModalOpen(true);
    };

    // Fungsi untuk menutup modal tambah berita
    const closeAddNewsModal = () => {
        setIsAddNewsModalOpen(false);
        setNewNews({ title: "", description: "", date: "", image: null, author: "" });
    };

    // Fungsi untuk menangani perubahan form input berita baru
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewNews((prev) => ({ ...prev, [name]: value }));
    };

    // Fungsi untuk menangani unggahan gambar
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
    
        if (file.size > 5 * 1024 * 1024) { // Validasi ukuran file (5MB)
            alert("Ukuran file terlalu besar! Maksimal 5MB.");
            return;
        }

        try {
            // Opsi kompresi
            const options = {
                maxSizeMB: 0.8, // Maksimal ukuran file 0.8MB
                maxWidthOrHeight: 1920, // Maksimal dimensi gambar
                useWebWorker: true, // Gunakan web worker untuk performa lebih baik
                fileType: 'image/jpeg', // Format output
            };

            // Kompres gambar
            const compressedFile = await imageCompression(file, options);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewNews((prev) => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(compressedFile);
        } catch (error) {
            console.error('Error compressing image:', error);
            alert('Gagal mengkompresi gambar. Silakan coba lagi.');
        }
    };
    
    
    
    const handleUpdateInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedNews((prev) => ({ ...prev, [name]: value }));
    };


    const handleUpdateImageUpload = async (e) => {
        const file = e.target.files[0];
    
        if (file) {
            try {
                // Opsi kompresi
                const options = {
                    maxSizeMB: 1, // Maksimal ukuran file 1MB
                    maxWidthOrHeight: 1920, // Maksimal dimensi gambar
                    useWebWorker: true, // Gunakan web worker untuk performa lebih baik
                    fileType: 'image/jpeg', // Format output
                };

                // Kompres gambar
                const compressedFile = await imageCompression(file, options);
                
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64Image = reader.result;
                    setUpdatedNews((prev) => ({ ...prev, image: base64Image }));
                };
                reader.readAsDataURL(compressedFile);
            } catch (error) {
                console.error('Error compressing image:', error);
                alert('Gagal mengkompresi gambar. Silakan coba lagi.');
            }
        }
    };
    

    // Fungsi untuk menambahkan berita baru
    const handleAddNews = async () => {
        const formData = {
            title: newNews.title,
            description: newNews.description,
            date: newNews.date,
            image: newNews.image, // Base64 string sudah ada di sini
            author: newNews.author,
        };
    
        console.log("Request Data:", formData); // Debugging
    
        try {
            const response = await fetch("http://85.209.163.237:5000/api/news", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
    
            if (response.ok) {
                const addedNews = await response.json();
                console.log("Response:", addedNews);
                setNewsData((prevData) => [...prevData, addedNews]);
                setFilteredNews((prevData) => [...prevData, addedNews]);
                closeAddNewsModal();
            } else {
                const error = await response.json();
                console.error("Error Response:", error);
            }
        } catch (error) {
            console.error("Error adding news:", error);
        }
    };
    
    

    const handleUpdateNews = async () => {
        const formData = {
            title: updatedNews.title,
            description: updatedNews.description,
            date: updatedNews.date,
            image: updatedNews.image, // Pastikan base64 image dikirim di sini
            author: updatedNews.author,
        };
    
        try {
            const response = await fetch(`http://85.209.163.237:5000/api/news/${updatedNews.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
    
            if (response.ok) {
                const updatedItem = await response.json();
                setNewsData((prevData) =>
                    prevData.map((news) => (news.id === updatedItem.id ? updatedItem : news))
                );
                setFilteredNews((prevData) =>
                    prevData.map((news) => (news.id === updatedItem.id ? updatedItem : news))
                );
                closeUpdateModal();
            } else {
                const error = await response.json();
                console.error("Error updating news:", error);
            }
        } catch (error) {
            console.error("Error updating news:", error);
        }
    };
    

    // Fungsi untuk menghapus berita
    const handleDelete = async () => {
        try {
            await fetch(`http://85.209.163.237:5000/api/news/${selectedNewsId}`, { method: "DELETE" });
            setNewsData((prevData) => prevData.filter((news) => news.id !== selectedNewsId));
            setFilteredNews((prevData) => prevData.filter((news) => news.id !== selectedNewsId));
        } catch (error) {
            console.error("Error deleting news:", error);
        } finally {
            closeDeleteModal(); // Tutup modal setelah penghapusan selesai
        }
    };

    // Muat data berita saat komponen dimuat
    useEffect(() => {
        fetchNews();
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
                        <h1 className="header-title">Manajemen News</h1>
                        <img src={logo} alt="Company Logo" className="header-logo-right" />
                    </div>
                    <br />
                    <p style={{ color: "#fff" }}>
                        Ini adalah konten halaman Kelola Berita. Lorem ipsum dolor sit amet,
                        consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.
                    </p>
                    <br />
                    <div
                        className="action-bar"
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "10px",
                            paddingRight: "50px",
                        }}
                    >
                        <div className="search-data-news" style={{ flex: 1 }}>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Cari berita..."
                                className="search-input"
                                style={{
                                    width: "50%",
                                    padding: "8px",
                                    border: "1px solid #ccc",
                                    borderRadius: "5px",
                                    marginRight: "10px",
                                }}
                            />
                        </div>
                        <div
                            className="tambah-news"
                            style={{ textAlign: "right" }}
                        >
                            <button
                                onClick={openAddNewsModal}
                                style={{ background: "#002966", color: "#fff", textDecoration: "none", padding: "10px", borderRadius: "10px" }}
                            >
                                Add News
                            </button>
                        </div>
                    </div>

                    <div className="card-data-news">
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid #002966" }}>
                                        <th>No</th>
                                        <th>Judul</th>
                                        <th>Deskripsi</th>
                                        <th>Tanggal</th>
                                        <th>Gambar</th>
                                        <th>Author</th>
                                        <th>Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((news, index) => (
                                        <tr key={news.id}>
                                            <td>{indexOfFirstItem + index + 1}</td>
                                            <td>{news.title}</td>
                                            <td>{truncateText(news.description, 100)}</td>
                                            <td>{news.date}</td>
                                            <td>
                                                <img
                                                    src={news.image} 
                                                    alt={news.title}
                                                    style={{ width: "50px", height: "auto" }}
                                                />
                                            </td>
                                            <td>{news.author}</td>
                                            <td>
                                                <i
                                                    className="fas fa-edit icon-update"
                                                    onClick={() => openUpdateModal(news)}
                                                    title="Update"
                                                ></i>
                                                <i
                                                    className="fas fa-trash icon-delete"
                                                    onClick={() => openDeleteModal(news.id)}
                                                    title="Hapus"
                                                ></i>
                                            </td>
                                        </tr>
                                    ))}
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

            {/* Modal Tambah Berita */}
            {isAddNewsModalOpen && (
                <div className="modal-addNews">
                    <div className="modal-popUpNews">
                        <h2 style={{color:"#002966"}}>Tambah Berita Baru</h2>
                        <form>
                            <label>Judul</label>
                            <input
                                type="text"
                                name="title"
                                value={newNews.title}
                                onChange={handleInputChange}
                                placeholder="Masukkan judul"
                            />
                            <label>Deskripsi</label>
                            <textarea
                                name="description"
                                value={newNews.description}
                                onChange={handleInputChange}
                                placeholder="Masukkan deskripsi"
                            ></textarea>
                            <label>Tanggal</label>
                            <input
                                type="date"
                                name="date"
                                value={newNews.date}
                                onChange={handleInputChange}
                            />
                            <label>Unggah Gambar</label>
                            <input
                                type="file"
                                name="image"
                                onChange={handleImageUpload}
                            />
                            <label>Author</label>
                            <input
                                type="text"
                                name="author"
                                value={newNews.author}
                                onChange={handleInputChange}
                                placeholder="Masukkan nama author"
                            />
                        </form>
                        <div className="modal-addActions">
                            <button className="btn-cancel2" onClick={closeAddNewsModal}>Batal</button>
                            <button className="btn-submit2" onClick={handleAddNews}>Publish</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal Update Berita */}
            {isUpdateModalOpen && (
                <div className="modal-addNews">
                    <div className="modal-popUpNews">
                        <h2 style={{color:"#002966"}}>Update Berita</h2>
                        <form>
                            <label>Judul</label>
                            <input
                                type="text"
                                name="title"
                                value={updatedNews.title}
                                onChange={handleUpdateInputChange}
                                placeholder="Masukkan judul"
                            />
                            <label>Deskripsi</label>
                            <textarea
                                name="description"
                                value={updatedNews.description}
                                onChange={handleUpdateInputChange}
                                placeholder="Masukkan deskripsi"
                            ></textarea>
                            <label>Tanggal</label>
                            <input
                                type="date"
                                name="date"
                                value={updatedNews.date}
                                onChange={handleUpdateInputChange}
                            />
                            <label>Unggah Gambar</label>
                            <input
                                type="file"
                                name="image"
                                onChange={handleUpdateImageUpload}
                            />
                            <label>Author</label>
                            <input
                                type="text"
                                name="author"
                                value={updatedNews.author}
                                onChange={handleUpdateInputChange}
                                placeholder="Masukkan nama author"
                            />
                        </form>
                        <div className="modal-addActions">
                            <button className="btn-cancel2" onClick={closeUpdateModal}>Batal</button>
                            <button className="btn-submit2" onClick={handleUpdateNews}>Update</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Konfirmasi Penghapusan</h2>
                        <img
                            alt="Illustration of a person thinking with a question mark above their head"
                            height="150"
                            src="https://storage.googleapis.com/a1aa/image/iS0IKTRAVK41G93YEDdkRCDS1lX6vi9XfwTUqXvDh60we04TA.jpg"
                            width="150"
                        />
                        <p>Apakah Anda yakin ingin menghapus berita ini?</p>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={closeDeleteModal}>
                                Batal
                            </button>
                            <button className="btn-delete" onClick={handleDelete}>
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default News;
