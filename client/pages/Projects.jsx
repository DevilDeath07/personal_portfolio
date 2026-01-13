import { useState, useEffect } from 'react';
import { projects as localProjects } from '../data/index';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        technologies: '',
        link: '',
        liveLink: ''
    });
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Debugging
        console.log("Projects Page Loaded");
        console.log("Local Projects Data:", localProjects);

        // Use local data with safety fallback
        if (localProjects) {
            setProjects(localProjects);
        } else {
            console.error("Local projects data is undefined!");
            setProjects([]);
        }
        setLoading(false);

        // Check for token updates
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
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (image) data.append('image', image);

        try {
            setMessage('Adding project...');
            const res = await axios.post('/api/projects', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setProjects([res.data, ...projects]);
            setMessage('Project added successfully!');
            setShowForm(false);
            setFormData({
                title: '',
                description: '',
                technologies: '',
                link: '',
                liveLink: ''
            });
            setImage(null);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage('Failed to add project.');
        }
    };

    return (
        <section className="section bg-light fade-in">
            <div className="container" style={{ paddingBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 className="section-title slide-in-left" style={{ marginBottom: 0 }}>My Projects</h2>
                    {token && (
                        <button
                            className="btn hover-pulse"
                            onClick={() => setShowForm(!showForm)}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                        >
                            {showForm ? 'Cancel' : 'Add Project'}
                        </button>
                    )}
                </div>

                {message && <p style={{ textAlign: 'center', marginBottom: '1rem', color: message.includes('Failed') ? 'red' : 'green' }}>{message}</p>}

                {showForm && (
                    <div className="contact-form slide-up" style={{ maxWidth: '600px', margin: '0 auto 3rem auto', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Add New Project</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Project Title *</label>
                                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Description *</label>
                                <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} required></textarea>
                            </div>
                            <div className="form-group">
                                <label>Technologies (comma separated) *</label>
                                <input type="text" name="technologies" value={formData.technologies} onChange={handleInputChange} placeholder="React, Node.js, etc." required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>GitHub Link</label>
                                    <input type="url" name="link" value={formData.link} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Live Demo Link</label>
                                    <input type="url" name="liveLink" value={formData.liveLink} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Project Image</label>
                                <input type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" />
                            </div>
                            <button type="submit" className="btn" style={{ width: '100%' }}>Add Project</button>
                        </form>
                    </div>
                )}

                {loading ? <p className="text-center">Loading projects...</p> : (
                    <div className="premium-grid slide-up" style={{ animationDelay: '0.2s' }}>
                        {projects.length === 0 ? <p>No projects added yet.</p> : projects.map(proj => (
                            <div key={proj._id} className="premium-card">
                                <div className="premium-card-front">
                                    <div className="card-image-container">
                                        {proj.fileUrl ? (
                                            <img
                                                src={proj.fileUrl}
                                                alt={proj.title}
                                            />
                                        ) : (
                                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e9ecef', color: '#888' }}>
                                                No Preview
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-content">
                                        <h3 className="card-title">{proj.title}</h3>
                                        <p className="card-subtitle" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {proj.technologies}
                                        </p>
                                    </div>
                                </div>
                                <div className="premium-overlay">
                                    <h3 style={{ marginBottom: '0.5rem' }}>{proj.title}</h3>
                                    <p className="overlay-description" style={{ maxHeight: '100px', overflowY: 'auto' }}>{proj.description}</p>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                        {proj.link && (
                                            <a href={proj.link} target="_blank" rel="noopener noreferrer" className="overlay-btn">
                                                Details
                                            </a>
                                        )}
                                        {proj.liveLink && (
                                            <a href={proj.liveLink} target="_blank" rel="noopener noreferrer" className="overlay-btn" style={{ background: 'white', color: 'var(--primary-color)' }}>
                                                View
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Projects;
