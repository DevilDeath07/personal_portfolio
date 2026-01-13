import { useState, useEffect } from 'react';
import { experience as localExperience } from '../data/index';

const Experience = () => {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [formData, setFormData] = useState({
        role: '',
        company: '',
        period: '',
        description: ''
    });
    const [logo, setLogo] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Use local data
        setExperiences(localExperience);
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

        if (!logo) {
            setMessage('Please upload a company logo.');
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('logo', logo);

        try {
            setMessage('Adding experience...');
            const res = await axios.post('/api/experience', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setExperiences([res.data, ...experiences]);
            setMessage('Experience added successfully!');
            setShowForm(false);
            setFormData({
                role: '',
                company: '',
                period: '',
                description: ''
            });
            setLogo(null);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage('Failed to add experience.');
        }
    };

    return (
        <section className="section bg-light fade-in">
            <div className="container" style={{ paddingBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 className="section-title slide-in-left" style={{ marginBottom: 0 }}>My Experience</h2>
                    {token && (
                        <button
                            className="btn hover-pulse"
                            onClick={() => setShowForm(!showForm)}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                        >
                            {showForm ? 'Cancel' : 'Add Experience'}
                        </button>
                    )}
                </div>

                {message && <p style={{ textAlign: 'center', marginBottom: '1rem', color: message.includes('Failed') ? 'red' : 'green' }}>{message}</p>}

                {showForm && (
                    <div className="contact-form slide-up" style={{ maxWidth: '600px', margin: '0 auto 3rem auto', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', background: 'white' }}>
                        <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Add Experience</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Job Role *</label>
                                <input type="text" name="role" value={formData.role} onChange={handleInputChange} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Company Name *</label>
                                    <input type="text" name="company" value={formData.company} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Period (e.g. 2021 - 2023) *</label>
                                    <input type="text" name="period" value={formData.period} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange}></textarea>
                            </div>
                            <div className="form-group">
                                <label>Company Logo *</label>
                                <input type="file" onChange={(e) => setLogo(e.target.files[0])} accept="image/*" required />
                            </div>
                            <button type="submit" className="btn" style={{ width: '100%' }}>Add Experience</button>
                        </form>
                    </div>
                )}

                {loading ? <p className="text-center">Loading experience...</p> : (
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        {experiences.length === 0 ? <p className="text-center">No experience added yet.</p> : experiences.map((exp, index) => (
                            <div key={exp._id} className="slide-up" style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                gap: '3rem',
                                marginBottom: '4rem',
                                padding: '2rem',
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                                flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
                                animationDelay: `${index * 0.2}s`
                            }}>
                                {/* Logo/Image Section */}
                                <div style={{ flex: '0 0 200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {exp.logoUrl ? (
                                        <img
                                            src={exp.logoUrl}
                                            alt={exp.company}
                                            style={{
                                                width: '150px',
                                                height: '150px',
                                                objectFit: 'contain',
                                                borderRadius: '12px',
                                                padding: '10px',
                                                backgroundColor: '#f8f9fa'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '150px',
                                            height: '150px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: '#e9ecef',
                                            borderRadius: '12px',
                                            color: '#6c757d',
                                            fontWeight: 'bold',
                                            fontSize: '1.2rem'
                                        }}>
                                            {exp.company.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                {/* Content Section */}
                                <div style={{ flex: '1 1 400px' }}>
                                    <h3 style={{
                                        color: 'var(--primary-color)',
                                        fontSize: '1.8rem',
                                        marginBottom: '0.5rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {exp.role}
                                    </h3>
                                    <p style={{
                                        fontSize: '1.2rem',
                                        color: '#6c757d',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600'
                                    }}>
                                        {exp.company}
                                    </p>
                                    <p style={{
                                        fontSize: '0.95rem',
                                        color: '#999',
                                        marginBottom: '1rem',
                                        fontStyle: 'italic'
                                    }}>
                                        {exp.period}
                                    </p>
                                    <p style={{
                                        fontSize: '1rem',
                                        lineHeight: '1.7',
                                        color: '#555'
                                    }}>
                                        {exp.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Experience;
