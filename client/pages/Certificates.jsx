import { useState, useEffect } from 'react';
import { certificates as localCertificates } from '../data/index';

const Certificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [formData, setFormData] = useState({
        title: '',
        issuer: '',
        year: '',
        description: ''
    });
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Use local data directly
        setCertificates(localCertificates);
        setLoading(false);
        const handleStorageChange = () => {
            setToken(localStorage.getItem('token'));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            setMessage('Please upload an image.');
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('image', image);

        try {
            setMessage('Adding certificate...');
            const res = await axios.post('/api/certificates', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setCertificates([res.data, ...certificates]);
            setMessage('Certificate added successfully!');
            setShowForm(false);
            setFormData({
                title: '',
                issuer: '',
                year: '',
                description: ''
            });
            setImage(null);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage('Failed to add certificate.');
        }
    };

    return (
        <section className="section container fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="section-title slide-in-left" style={{ marginBottom: 0 }}>Certificates</h2>
                {token && (
                    <button
                        className="btn hover-pulse"
                        onClick={() => setShowForm(!showForm)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                        {showForm ? 'Cancel' : 'Add Certificate'}
                    </button>
                )}
            </div>

            {message && <p style={{ textAlign: 'center', marginBottom: '1rem', color: message.includes('Failed') ? 'red' : 'green' }}>{message}</p>}

            {showForm && (
                <div className="contact-form slide-up" style={{ maxWidth: '600px', margin: '0 auto 3rem auto', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', background: 'white' }}>
                    <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Add New Certificate</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Certificate Title *</label>
                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Issuer *</label>
                                <input type="text" name="issuer" value={formData.issuer} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Year *</label>
                                <input type="text" name="year" value={formData.year} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea name="description" rows="2" value={formData.description} onChange={handleInputChange}></textarea>
                        </div>
                        <div className="form-group">
                            <label>Certificate Image *</label>
                            <input type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" required />
                        </div>
                        <button type="submit" className="btn" style={{ width: '100%' }}>Add Certificate</button>
                    </form>
                </div>
            )}

            {loading ? <p className="text-center">Loading certificates...</p> : (
                <div className="premium-grid slide-up" style={{ minHeight: '200px', animationDelay: '0.2s' }}>
                    {certificates.length === 0 ? <p className="text-center">No certificates found.</p> : certificates.map(cert => (
                        <div key={cert._id} className="premium-card">
                            <div className="premium-card-front">
                                <div className="card-image-container">
                                    {cert.fileUrl ? (
                                        <img
                                            src={cert.fileUrl}
                                            alt={cert.title}
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200?text=No+Preview'; }}
                                        />
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>No Preview</div>
                                    )}
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">{cert.title}</h3>
                                    <p className="card-subtitle">{cert.issuer} | {cert.year}</p>
                                </div>
                            </div>
                            <div className="premium-overlay">
                                <h3 style={{ marginBottom: '1rem' }}>{cert.title}</h3>
                                <p className="overlay-description">{cert.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};
export default Certificates;
