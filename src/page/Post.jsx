import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../style/News.css";
import logo from "../assets/logo.png";
import bumn from "../assets/BUMN.png";
import "@fortawesome/fontawesome-free/css/all.min.css";

function Post() {
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
    const [itemsPerPage, setItemsPerPage] = useState(5); // Jumlah data per halaman (user-selectable)
    const [sortBy, setSortBy] = useState(null); // 'created_at' | 'similarity_score' | null
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Handler for itemsPerPage change
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const truncateText = (text, maxLength) => {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + "...";
        }
        return text;
    };

    // Fungsi untuk memberikan warna pada tag
    const getTagColor = (tag) => {
        const tagColors = {
            'hiburan': '#FF6B6B',
            'obrolan': '#4ECDC4',
            'kesehatan': '#45B7D1',
            'travel': '#96CEB4',
            'kuliner': '#FFEAA7',
            'olahraga': '#DDA0DD',
            'teknologi': '#FF8C42',
            'pendidikan': '#6C5CE7',
            'bisnis': '#00B894',
            'seni': '#E84393'
        };
        
        return tagColors[tag.toLowerCase()] || '#6C757D'; // Default color jika tag tidak ditemukan
    };

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredNews.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    // Form input state untuk berita baru
    const [newPost, setNewPost] = useState({
        ktpa: "",
        content: "",
        tags: "",
        media_url: null,
        media_type: null
    }); // Only user-editable fields

    const [updatedPost, setUpdatedPost] = useState({
        id: null,
        ktpa: "",
        content: "",
        tags: "",
        media_url: null,
        media_type: null
    }); // Only user-editable fields

    const openUpdateModal = (post) => {
        setUpdatedPost({
            id: post.id,
            ktpa: post.ktpa,
            content: post.content,
            tags: post.tags || "",
            media_url: null, // Media awal tidak ditampilkan
            media_type: post.media_type
            // blok removed
        });
        setIsUpdateModalOpen(true);
    };

    const closeUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setUpdatedPost({ id: null, ktpa: "", content: "", tags: "", media_url: null, media_type: null });
    };


    // Fungsi untuk toggle Navbar
    const handleToggle = (isActive) => {
        setIsNavbarActive(isActive);
    };

    // Fetch data berita dari API
    const fetchNews = async () => {
        setLoading(true);
        try {
            //const response = await fetch("http://localhost:5000/api/posts");
            const response = await fetch("http://85.209.163.237:5000/api/posts");
            const data = await response.json();
            setNewsData(data); // Set data ke state
            setFilteredNews(data); // Set data ke state yang difilter
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk menangani perubahan input pencarian
    const handleSearchChange = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);

        // Filter data berdasarkan KTPA, konten, atau tags
        const filtered = newsData.filter(
            (post) =>
                post.ktpa.toLowerCase().includes(value) ||
                post.content.toLowerCase().includes(value) ||
                (post.tags && post.tags.toLowerCase().includes(value))
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
        setNewPost({ ktpa: "", content: "", tags: "", media_url: null, media_type: null });
    };

    // Fungsi untuk menangani perubahan form input berita baru
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPost((prev) => ({ ...prev, [name]: value }));
    };

    // Fungsi untuk menangani unggahan gambar
    const handleMediaUpload = (e) => {
        const file = e.target.files[0];
    
        if (file.size > 5 * 1024 * 1024) { // Validasi ukuran file (5MB)
            alert("Ukuran file terlalu besar! Maksimal 5MB.");
            return;
        }
    
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewPost((prev) => ({
                ...prev,
                media_url: reader.result,
                media_type: file.type
            }));
        };
        reader.readAsDataURL(file);
    };
    
    
    
    const handleUpdateInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedPost((prev) => ({ ...prev, [name]: value }));
    };


    const handleUpdateMediaUpload = (e) => {
        const file = e.target.files[0];
    
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUpdatedPost((prev) => ({
                    ...prev,
                    media_url: reader.result,
                    media_type: file.type
                }));
            };
            reader.readAsDataURL(file);
        }
    };
    

    // Fungsi untuk menambahkan berita baru
    const handleAddPost = async () => {
        if (!newPost.ktpa || !newPost.content) {
            alert("KTPA dan konten harus diisi!");
            return;
        }

        const formData = new FormData();
        formData.append("ktpa", newPost.ktpa);
        formData.append("content", newPost.content);
        formData.append("tags", newPost.tags || "");

        
        if (newPost.media_url) {
            formData.append("media_url", newPost.media_url);
            formData.append("media_type", newPost.media_type);
        }

        try {
            const response = await fetch("http://85.209.163.237:5000/api/posts", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert("Post berhasil ditambahkan!");
                closeAddNewsModal();
                fetchNews(); // Refresh data setelah menambah post baru
                setNewPost({
                    ktpa: "",
                    content: "",
                    tags: "",
                    media_url: null,
                    media_type: null,

                });
            } else {
                alert("Gagal menambahkan post.");
            }
        } catch (error) {
            console.error("Error adding post:", error);
            alert("Terjadi kesalahan saat menambahkan post.");
        }
    };

    const handleUpdatePost = async () => {
        const formData = {
            ktpa: updatedPost.ktpa,
            content: updatedPost.content,
            tags: updatedPost.tags || "",
            media_url: updatedPost.media_url,
            media_type: updatedPost.media_type
        };

        try {
            const response = await fetch(`http://85.209.163.237:5000/api/posts/${updatedPost.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const updatedItem = await response.json();
                setNewsData((prevData) =>
                    prevData.map((post) => (post.id === updatedItem.id ? updatedItem : post))
                );
                setFilteredNews((prevData) =>
                    prevData.map((post) => (post.id === updatedItem.id ? updatedItem : post))
                );
                closeUpdateModal();
            } else {
                const error = await response.json();
                console.error("Error updating post:", error);
            }
        } catch (error) {
            console.error("Error updating post:", error);
        }
    };

    // Fungsi untuk menghapus berita
    const handleDelete = async () => {
        if (!selectedNewsId) return;

        try {
            const response = await fetch(`http://85.209.163.237:5000/api/posts/${selectedNewsId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Post berhasil dihapus!");
                closeDeleteModal();
                fetchNews(); // Refresh data setelah menghapus post
            } else {
                alert("Gagal menghapus post.");
            }
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Terjadi kesalahan saat menghapus post.");
        }
    };

    // Sorting handler
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(column);
            setSortOrder('desc'); // default to desc when changing column
        }
        setCurrentPage(1);
    };

    // Sorting logic for currentItems
    const sortedItems = [...filteredNews].sort((a, b) => {
        if (sortBy === 'created_at') {
            const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return sortOrder === 'asc' ? tA - tB : tB - tA;
        }
        if (sortBy === 'similarity_score') {
            const sA = typeof a.similarity_score === 'number' ? a.similarity_score : -Infinity;
            const sB = typeof b.similarity_score === 'number' ? b.similarity_score : -Infinity;
            return sortOrder === 'asc' ? sA - sB : sB - sA;
        }
        return 0;
    });
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);

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
                        <h1 className="header-title">Manajemen Post</h1>
                        <img src={logo} alt="Company Logo" className="header-logo-right" />
                    </div>
                    <br />
                    <p style={{ color: "#fff" }}>
                        Ini adalah halaman untuk mengelola post pengguna. Anda dapat menambah, mengubah,
                        atau menghapus post serta memblokir post yang melanggar ketentuan.
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
                                placeholder="Cari post..."
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
                            {/* <button
                                onClick={openAddNewsModal}
                                style={{ background: "#002966", color: "#fff", textDecoration: "none", padding: "10px", borderRadius: "10px" }}
                            >
                                Add Post
                            </button> */}
                        </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
    <label htmlFor="itemsPerPageSelect" style={{ marginRight: 8 }}>Tampilkan</label>
    <select
        id="itemsPerPageSelect"
        value={itemsPerPage}
        onChange={handleItemsPerPageChange}
        style={{ marginRight: 8 }}
    >
        <option value={5}>5</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
    </select>
    <span>post per halaman</span>
</div>
<div className="card-data-news">
    {loading ? (
    <p>Loading...</p>
) : (
                        <table>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #002966" }}>
                                <th>No</th>
                                <th>KTPA</th>
                                <th>Konten</th>
                                <th>Tags</th>
                                <th
                                    style={{ cursor: "pointer", userSelect: "none" }}
                                    onClick={() => handleSort('created_at')}
                                    title="Urutkan berdasarkan tanggal dibuat"
                                >
                                    Dibuat {sortBy === 'created_at' && (
                                        sortOrder === 'asc' ? (
                                            <span style={{ fontSize: 12 }}>▲</span>
                                        ) : (
                                            <span style={{ fontSize: 12 }}>▼</span>
                                        )
                                    )}
                                </th>
                                <th>Media</th>
                                <th
                                    style={{ cursor: "pointer", userSelect: "none" }}
                                    onClick={() => handleSort('similarity_score')}
                                    title="Urutkan berdasarkan similarity score"
                                >
                                    Similarity Score {sortBy === 'similarity_score' && (
                                        sortOrder === 'asc' ? (
                                            <span style={{ fontSize: 12 }}>▲</span>
                                        ) : (
                                            <span style={{ fontSize: 12 }}>▼</span>
                                        )
                                    )}
                                </th>
                                <th>Persen</th>
                                <th>Tindakan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((post, index) => (
                                <tr key={post.id}>
                                    <td>{indexOfFirstItem + index + 1}</td>
                                    <td>{post.ktpa}</td>
                                    <td>{truncateText(post.content, 100)}</td>
                                    <td>
                                        {post.tags ? (
                                            <span style={{
                                                backgroundColor: getTagColor(post.tags),
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                {post.tags}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#999', fontStyle: 'italic' }}>-</span>
                                        )}
                                    </td>
                                    <td>{new Date(post.created_at).toLocaleDateString()}</td>
                                    <td>
                                        {post.media_url ? (
                                            post.media_type?.startsWith('image') ? (
                                                <img
                                                    src={post.media_url}
                                                    alt="Post media"
                                                    style={{ width: "50px", height: "auto" }}
                                                />
                                            ) : (
                                                <span>{post.media_type}</span>
                                            )
                                        ) : (
                                            <span>teks</span>
                                        )}
                                    </td>
                                    <td>{typeof post.similarity_score !== 'undefined' ? post.similarity_score.toFixed(3) : '-'}</td>
                                    <td>{typeof post.similarity_score === 'number' ? (post.similarity_score * 100).toFixed(2) + '%' : '-'}</td>
                                    <td>
                                        <i
                                            className="fas fa-edit icon-update"
                                            onClick={() => openUpdateModal(post)}
                                            title="Update"
                                        ></i>
                                        <i
                                            className="fas fa-trash icon-delete"
                                            onClick={() => openDeleteModal(post.id)}
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
                        <h2 style={{color:"#002966"}}>Tambah Post Baru</h2>
                        <form>
                            <label>KTPA</label>
                            <input
                                type="text"
                                name="ktpa"
                                value={newPost.ktpa}
                                onChange={handleInputChange}
                                placeholder="Masukkan KTPA"
                            />
                            <label>Konten</label>
                            <textarea
                                name="content"
                                value={newPost.content}
                                onChange={handleInputChange}
                                placeholder="Masukkan konten post"
                            ></textarea>
                            <label>Tags</label>
                            <select
                                name="tags"
                                value={newPost.tags}
                                onChange={handleInputChange}
                                style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
                            >
                                <option value="">Pilih Tag</option>
                                <option value="hiburan">Hiburan</option>
                                <option value="obrolan">Obrolan</option>
                                <option value="kesehatan">Kesehatan</option>
                                <option value="travel">Travel</option>
                                <option value="kuliner">Kuliner</option>
                                <option value="olahraga">Olahraga</option>
                                <option value="teknologi">Teknologi</option>
                                <option value="pendidikan">Pendidikan</option>
                                <option value="bisnis">Bisnis</option>
                                <option value="seni">Seni</option>
                            </select>
                            <label>Media</label>
                            <input
                                type="file"
                                name="media"
                                onChange={handleMediaUpload}
                                accept="image/*,video/*"
                            />

                        </form>
                        <div className="modal-addActions">
                            <button className="btn-cancel2" onClick={closeAddNewsModal}>Batal</button>
                            /<button className="btn-submit2" onClick={handleAddPost}>Publish</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal Update Berita */}
            {isUpdateModalOpen && (
                <div className="modal-addNews">
                    <div className="modal-popUpNews">
                        <h2 style={{color:"#002966"}}>Update Post</h2>
                        <form>
                            <label>KTPA</label>
                            <input
                                type="text"
                                name="ktpa"
                                value={updatedPost.ktpa}
                                onChange={handleUpdateInputChange}
                                placeholder="Masukkan KTPA"
                                disabled
                            />
                            <label>Konten</label>
                            <textarea
                                name="content"
                                value={updatedPost.content}
                                onChange={handleUpdateInputChange}
                                placeholder="Masukkan konten post"
                            ></textarea>
                            <label>Tags</label>
                            <select
                                name="tags"
                                value={updatedPost.tags}
                                onChange={handleUpdateInputChange}
                                style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
                            >
                                <option value="">Pilih Tag</option>
                                <option value="hiburan">Hiburan</option>
                                <option value="obrolan">Obrolan</option>
                                <option value="kesehatan">Kesehatan</option>
                                <option value="travel">Travel</option>
                                <option value="kuliner">Kuliner</option>
                                <option value="olahraga">Olahraga</option>
                                <option value="teknologi">Teknologi</option>
                                <option value="pendidikan">Pendidikan</option>
                                <option value="bisnis">Bisnis</option>
                                <option value="seni">Seni</option>
                            </select>
                            <label>Media</label>
                            <input
                                type="file"
                                name="media"
                                onChange={handleUpdateMediaUpload}
                                accept="image/*,video/*"
                            />

                        </form>
                        <div className="modal-addActions">
                            <button className="btn-cancel2" onClick={closeUpdateModal}>Batal</button>
                            <button className="btn-submit2" onClick={handleUpdatePost}>Update</button>
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
                        <p>Apakah Anda yakin ingin menghapus post ini?</p>
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

export default Post;
