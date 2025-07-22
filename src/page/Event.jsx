import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../style/Event.css";
import logo from "../assets/logo.png";
import bumn from "../assets/BUMN.png";

function Event() {
    const [isNavbarActive, setIsNavbarActive] = useState(false); // Status navbar
    const [eventData, setEventData] = useState([]); // Data event
    const [filteredEvent, setFilteredEvent] = useState([]); // Data event yang difilter
    const [searchTerm, setSearchTerm] = useState(""); // Kata kunci pencarian
    const [loading, setLoading] = useState(true); // Status loading
    const [isModalOpen, setIsModalOpen] = useState(false); // Status modal konfirmasi
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false); // Status modal tambah berita
    const [selectedEventId, setSelectedEventId] = useState(null); // ID berita yang akan dihapus
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); // Halaman saat ini
    const itemsPerPage = 5; // Jumlah data per halaman

    const indexOfLastItem = currentPage * itemsPerPage; // Indeks data terakhir
    const indexOfFirstItem = indexOfLastItem - itemsPerPage; // Indeks data pertama
    const currentItems = filteredEvent.slice(indexOfFirstItem, indexOfLastItem); // Potong data
    const paginate = (pageNumber) => setCurrentPage(pageNumber);


    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredEvent.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }
    // Fungsi untuk menerima status toggle dari Navbar
    const handleToggle = (isActive) => {
        setIsNavbarActive(isActive);
    };

    // Form input state untuk event baru
    const [newEvent, setNewEvent] = useState({
        id: "",
        ktpa: "",            // Nomor identitas (bisa opsional jika admin)
        evtitle: "",         // Judul event
        evdesc: "",          // Deskripsi event
        evdate: "",          // Tanggal event
        evloc: "",           // Lokasi event
        evkuota: "",         // Kuota peserta
        eventpic: null,      // Gambar event (base64)
    });

    const [updatedEvent, setUpdatedEvent] = useState({
        id: null,
        ktpa: "",
        evtitle: "",
        evdesc: "",
        evdate: "",
        evloc: "",
        evkuota: "",
        eventpic: null,
    });


    const openUpdateModal = (event) => {
        setUpdatedEvent({
            id: event.id,
            evtitle: event.evtitle,
            evdesc: event.evdesc,
            evdate: event.evdate,
            evloc: event.evloc,
            evkuota: event.evkuota,
            eventpic: null, // Gambar awal tidak ditampilkan
        });
        setIsUpdateModalOpen(true);
    };

    const closeUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setUpdatedEvent({
            id: null,
            ktpa: "",
            evtitle: "",
            evdesc: "",
            evdate: "",
            evloc: "",
            evkuota: "",
            eventpic: null
        });
    };


    // Fetch data event dari API
    const fetchEvent = async () => {
        setLoading(true);
        try {
            console.log('Fetching events from: http://85.209.163.237:5000/api/event');
            const response = await fetch("http://85.209.163.237:5000/api/event");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Fetched events data:', data);
            if (Array.isArray(data)) {
                data.forEach(event => {
                    console.log(`Event ID: ${event.id}, Event Pic: ${event.eventpic}`);
                });
            }
            setEventData(data);
            setFilteredEvent(data);
        } catch (error) {
            console.error("Error details:", {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            setEventData([]);
            setFilteredEvent([]);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk menangani perubahan input pencarian
    const handleSearchChange = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);

        // Filter data berdasarkan judul atau deskripsi
        const filtered = eventData.filter(
            (event) =>
                (event.evtitle?.toLowerCase().includes(value) || false) ||
                (event.evdesc?.toLowerCase().includes(value) || false)
        );
        setFilteredEvent(filtered);
    };

    // Fungsi untuk membuka modal konfirmasi
    const openDeleteModal = (id) => {
        setSelectedEventId(id);
        setIsModalOpen(true);
    };

    // Fungsi untuk menutup modal konfirmasi
    const closeDeleteModal = () => {
        setIsModalOpen(false);
        setSelectedEventId(null);
    };

    // Fungsi untuk membuka modal tambah berita
    const openAddEventModal = () => {
        setIsAddEventModalOpen(true);
    };

    // Fungsi untuk menutup modal tambah berita
    const closeAddEventModal = () => {
        setIsAddEventModalOpen(false);
        setNewEvent({
            ktpa: "",
            evtitle: "",
            evdesc: "",
            evdate: "",
            evloc: "",
            evkuota: "",
            eventpic: null
        });
    };

    // Fungsi untuk menangani perubahan form input berita baru
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEvent((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedEvent((prev) => ({ ...prev, [name]: value }));
    };


    // Fungsi untuk menangani unggahan gambar
    const handleImageUpload = (e, setFunction) => {
        const file = e.target.files[0];

        if (file) {
            if (file.size > 5 * 1024 * 1024) { // Batas 5MB
                alert("Ukuran file terlalu besar! Maksimal 5MB.");
                e.target.value = null; // Reset file input
                return;
            }
            setFunction((prev) => ({ ...prev, eventpic: file })); // Simpan file object dalam state
        }
    };




    // const handleUpdateImageUpload = (e) => {
    //     const file = e.target.files[0];

    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             const base64Image = reader.result;
    //             setUpdatedEvent((prev) => ({ ...prev, image: base64Image }));
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // };


    // Fungsi untuk menambahkan event baru
    const handleAddEvent = async () => {
        const formData = new FormData();
        formData.append("ktpa", newEvent.ktpa);
        formData.append("evtitle", newEvent.evtitle);
        formData.append("evdesc", newEvent.evdesc);
        formData.append("evdate", newEvent.evdate);
        formData.append("evloc", newEvent.evloc);
        formData.append("evkuota", newEvent.evkuota);
        if (newEvent.eventpic instanceof File) {
            formData.append("image", newEvent.eventpic); // Use 'image' as key, similar to Java
        }

        try {
            const response = await fetch("http://85.209.163.237:5000/api/events", {
                method: "POST",
                // Headers 'Content-Type': 'multipart/form-data' is set automatically by the browser for FormData
                body: formData,
            });

            if (response.ok) {
                fetchEvent(); // Refresh data
                closeAddEventModal();
            } else {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                console.error("Error adding event - Server responded with:", errorData);
                alert(`Error adding event: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error adding event:", error);
            alert(`Error adding event: ${error.message}`);
        }
    };

    const handleUpdateEvent = async () => {
        const formData = new FormData();
        formData.append("ktpa", updatedEvent.ktpa); // Assuming ktpa might be updated or needed by backend
        formData.append("evtitle", updatedEvent.evtitle);
        formData.append("evdesc", updatedEvent.evdesc);
        formData.append("evdate", updatedEvent.evdate);
        formData.append("evloc", updatedEvent.evloc);
        formData.append("evkuota", updatedEvent.evkuota);
        if (updatedEvent.eventpic instanceof File) {
            formData.append("image", updatedEvent.eventpic); // Use 'image' as key
        }
        // If you don't want to send an image if it's not changed, 
        // you might need more complex logic or a specific backend handling for null/empty image field.

        try {
            const response = await fetch(`http://85.209.163.237:5000/api/event/${updatedEvent.id}`, {
                method: "PUT",
                // Headers 'Content-Type': 'multipart/form-data' is set automatically by the browser for FormData
                body: formData,
            });

            if (response.ok) {
                fetchEvent();
                closeUpdateModal();
            } else {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                console.error("Error updating event - Server responded with:", errorData);
                alert(`Error updating event: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error updating event:", error);
            alert(`Error updating event: ${error.message}`);
        }
    };


    // Fungsi untuk menghapus event
    const handleDelete = async () => {
        try {
            await fetch(`http://85.209.163.237:5000/api/event/${selectedEventId}`, { method: "DELETE" });
            setEventData((prevData) => prevData.filter((event) => event.id !== selectedEventId));
            setFilteredEvent((prevData) => prevData.filter((event) => event.id !== selectedEventId));
        } catch (error) {
            console.error("Error deleting event:", error);
        } finally {
            closeDeleteModal(); // Tutup modal setelah penghapusan selesai
        }
    };


    const truncateText = (text, maxLength) => {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + "...";
        }
        return text;
    };
    
    // Muat data berita saat komponen dimuat
    useEffect(() => {
        fetchEvent();
    }, []);

    return (
        <>
            <div
                className={`layout-container ${isNavbarActive ? "navbar-active" : ""}`}
            ><div className={`navbar-event ${isNavbarActive ? "active" : ""}`}>
                    <Navbar onToggle={handleToggle} />
                </div>
                <div className={`event-content ${isNavbarActive ? "shifted" : ""}`}>
                    <div className="header-event">
                        <img src={bumn} alt="BUMN Logo" className="header-logo-left" />
                        <h1 className="header-title">Manajemen Event</h1>
                        <img src={logo} alt="Company Logo" className="header-logo-right" />
                    </div>
                    <br />
                    <p style={{ color: "#fff" }}>
                        Ini adalah konten halaman Kelola event. Lorem ipsum dolor sit amet,
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
                        <div className="search-data-event" style={{ flex: 1 }}>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Cari event..."
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
                            className="tambah-event"
                            style={{ textAlign: "right" }}
                        >
                            <button
                                onClick={openAddEventModal}
                                style={{ background: "#002966", color: "#fff", textDecoration: "none", padding: "10px", borderRadius: "10px" }}
                            >
                                Add Event
                            </button>
                        </div>
                    </div>

                    <div className="card-data-event">
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
                                        <th>Lokasi</th>
                                        <th>Kuota</th>
                                        <th>Gambar</th>
                                        <th>Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((event, index) => (
                                        <tr key={event.id}>
                                            <td>{indexOfFirstItem + index + 1}</td>
                                            <td>{event.evtitle}</td>
                                            <td>{truncateText(event.evdesc, 100)}</td> {/* Batas 100 karakter */}
                                            <td>{event.evdate}</td>
                                            <td>{event.evloc}</td>
                                            <td>{event.evkuota}</td>
                                            <td>
                                                <img
                                                    src={event.eventpic}
                                                    alt={event.evtitle}
                                                    style={{ width: "50px", height: "auto" }}
                                                />
                                            </td>
                                            <td>
                                                <i className="fas fa-edit icon-update" onClick={() => openUpdateModal(event)} title="Update"></i>
                                                <i className="fas fa-trash icon-delete" onClick={() => openDeleteModal(event.id)} title="Hapus"></i>
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
            {isAddEventModalOpen && (
                <div className="modal-addEvent">
                    <div className="modal-popUpEvent">
                        <h2 style={{ color: "#002966" }}>Tambah Event Baru</h2>
                        <form>
                            <label>Nama Admin</label>
                            <input
                                type="text"
                                name="ktpa"
                                value={newEvent.ktpa}
                                onChange={handleInputChange}
                                placeholder="Masukkan Nama"
                            />
                            <label>Judul Event</label>
                            <input
                                type="text"
                                name="evtitle"
                                value={newEvent.evtitle}
                                onChange={handleInputChange}
                                placeholder="Masukkan judul event"
                            />
                            <label>Deskripsi</label>
                            <textarea
                                name="evdesc"
                                value={newEvent.evdesc}
                                onChange={handleInputChange}
                                placeholder="Masukkan deskripsi event"
                            />
                            <label>Tanggal</label>
                            <input
                                type="datetime-local"
                                name="evdate"
                                value={newEvent.evdate}
                                onChange={handleInputChange}
                            />
                            <label>Lokasi</label>
                            <input
                                type="text"
                                name="evloc"
                                value={newEvent.evloc}
                                onChange={handleInputChange}
                                placeholder="Masukkan lokasi event"
                            />
                            <label>Kuota</label>
                            <input
                                type="text"
                                name="evkuota"
                                value={newEvent.evkuota}
                                onChange={handleInputChange}
                                placeholder="Masukkan kuota peserta"
                            />
                            <label>Unggah Gambar</label>
                            <input
                                type="file"
                                name="eventpic"
                                onChange={(e) => handleImageUpload(e, setNewEvent)}
                            />

                        </form>

                        <div className="modal-addActions">
                            <button className="btn-cancel2" onClick={closeAddEventModal}>Batal</button>
                            <button className="btn-submit2" onClick={handleAddEvent}>Publish</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal Update event */}
            {isUpdateModalOpen && (
                <div className="modal-addEvent">
                    <div className="modal-popUpEvent">
                        <h2 style={{ color: "#002966" }}>Update Event</h2>
                        <form>
    <label>Nama Admin</label>
    <input
        type="text"
        name="ktpa"
        value={updatedEvent.ktpa}
        onChange={handleUpdateInputChange}
        placeholder="Masukkan Nama"
    />
    <label>Judul Event</label>
    <input
        type="text"
        name="evtitle"
        value={updatedEvent.evtitle}
        onChange={handleUpdateInputChange}
        placeholder="Masukkan judul event"
    />
    <label>Deskripsi</label>
    <textarea
        name="evdesc"
        value={updatedEvent.evdesc}
        onChange={handleUpdateInputChange}
        placeholder="Masukkan deskripsi event"
    />
    <label>Tanggal</label>
    <input
        type="datetime-local"
        name="evdate"
        value={updatedEvent.evdate}
        onChange={handleUpdateInputChange}
    />
    <label>Lokasi</label>
    <input
        type="text"
        name="evloc"
        value={updatedEvent.evloc}
        onChange={handleUpdateInputChange}
        placeholder="Masukkan lokasi event"
    />
    <label>Kuota</label>
    <input
        type="text"
        name="evkuota"
        value={updatedEvent.evkuota}
        onChange={handleUpdateInputChange}
        placeholder="Masukkan kuota peserta"
    />
    <label>Unggah Gambar</label>
    <input
        type="file"
        name="eventpic"
        onChange={(e) => handleImageUpload(e, setUpdatedEvent)}
    />
</form>

                        <div className="modal-addActions">
                            <button className="btn-cancel2" onClick={closeUpdateModal}>Batal</button>
                            <button className="btn-submit2" onClick={handleUpdateEvent}>Update</button>
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
                        <p>Apakah Anda yakin ingin menghapus event ini?</p>
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


export default Event;
