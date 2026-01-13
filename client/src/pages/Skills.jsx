import { useState, useEffect } from 'react';
import { skills as localSkills } from '../data/index';

const Skills = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [formData, setFormData] = useState({
        name: '',
        level: '',
        description: '',
        category: 'Programming Languages'
    });
    const [message, setMessage] = useState('');

    const CATEGORIES = [
        'Programming Languages',
        'Frontend',
        'Backend',
        'Database',
        'DevOps/Containerization',
        'Version Control',
        'Automation Tools',
        'Core CS Fundamentals',
        'Data Science & AI',
        'Tools',
        'Other'
    ];

    useEffect(() => {
        // Use local data
        setSkills(localSkills);
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
        try {
            setMessage('Adding skill...');
            const res = await axios.post('/api/skills', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSkills([res.data, ...skills]);
            setMessage('Skill added successfully!');
            setShowForm(false);
            setFormData({
                name: '',
                level: '',
                description: '',
                category: 'Programming Languages'
            });
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage('Failed to add skill.');
        }
    };

    return (
        <section className="section gradient-bg fade-in">
            <div className="container" style={{ paddingBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 className="section-title slide-in-left" style={{ marginBottom: 0 }}>My Technical Skills</h2>
                    {token && (
                        <button
                            className="btn hover-pulse"
                            onClick={() => setShowForm(!showForm)}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                        >
                            {showForm ? 'Cancel' : 'Add Skill'}
                        </button>
                    )}
                </div>

                <p className="slide-up" style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem', animationDelay: '0.2s' }}>
                    Technologies and tools I work with
                </p>

                {message && <p style={{ textAlign: 'center', marginBottom: '1rem', color: message.includes('Failed') ? 'red' : 'green' }}>{message}</p>}

                {showForm && (
                    <div className="contact-form slide-up" style={{ maxWidth: '600px', margin: '0 auto 3rem auto', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', background: 'white' }}>
                        <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Add New Skill</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Skill Name *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Category *</label>
                                <select name="category" value={formData.category} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Proficiency Level (e.g. 90%) *</label>
                                <input type="text" name="level" value={formData.level} onChange={handleInputChange} placeholder="e.g. 80%" required />
                            </div>
                            <div className="form-group">
                                <label>Description (Optional)</label>
                                <textarea name="description" rows="2" value={formData.description} onChange={handleInputChange}></textarea>
                            </div>
                            <button type="submit" className="btn" style={{ width: '100%' }}>Add Skill</button>
                        </form>
                    </div>
                )}

                {loading ? <p className="text-center">Loading skills...</p> : skills.length === 0 ? (
                    <p className="text-center">No skills added yet.</p>
                ) : (
                    <>
                        {/* Group skills by category */}
                        {CATEGORIES.map(category => {
                            const categorySkills = skills.filter(skill => skill.category === category);

                            if (categorySkills.length === 0) return null;

                            // Category icons
                            const categoryIcons = {
                                'Programming Languages': 'bx-code-curly',
                                'Frontend': 'bx-code-alt',
                                'Backend': 'bx-server',
                                'Database': 'bx-data',
                                'DevOps/Containerization': 'bxl-docker',
                                'Version Control': 'bxl-git',
                                'Automation Tools': 'bx-bot',
                                'Core CS Fundamentals': 'bx-chip',
                                'Data Science & AI': 'bx-brain',
                                'Tools': 'bx-wrench',
                                'Other': 'bx-layer'
                            };

                            // Category colors - vibrant gradients
                            const categoryColors = {
                                'Programming Languages': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                'Frontend': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                'Backend': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                'Database': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                                'DevOps/Containerization': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                                'Version Control': 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
                                'Automation Tools': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                                'Core CS Fundamentals': 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
                                'Data Science & AI': 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
                                'Tools': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                'Other': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                            };

                            return (
                                <div key={category} style={{ marginBottom: '3rem' }}>
                                    {/* Category Header */}
                                    <div className="slide-in-left" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        marginBottom: '1.5rem',
                                        paddingBottom: '0.75rem',
                                        borderBottom: '2px solid rgba(0,0,0,0.1)'
                                    }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '12px',
                                            background: categoryColors[category],
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
                                        }}>
                                            <i className={`bx ${categoryIcons[category]}`} style={{ fontSize: '1.8rem', color: 'white' }}></i>
                                        </div>
                                        <h3 style={{
                                            fontSize: '1.8rem',
                                            fontWeight: 'bold',
                                            color: 'var(--text-color)',
                                            margin: 0
                                        }}>
                                            {category}
                                        </h3>
                                        <span style={{
                                            marginLeft: 'auto',
                                            padding: '0.25rem 0.75rem',
                                            background: 'white',
                                            borderRadius: '20px',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            color: 'var(--text-muted)',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}>
                                            {categorySkills.length} {categorySkills.length === 1 ? 'skill' : 'skills'}
                                        </span>
                                    </div>

                                    {/* Skills Grid for this category */}
                                    <div className="premium-grid slide-up" style={{ animationDelay: '0.2s' }}>
                                        {categorySkills.map(skill => (
                                            <div key={skill._id} className="premium-card skill-card">
                                                <div className="premium-card-front">
                                                    <div className="card-content">
                                                        <div className="card-title">{skill.name}</div>
                                                        <div className="card-subtitle">{skill.category}</div>
                                                        <div className="skill-level-bar">
                                                            <div className="skill-level-fill" style={{ width: skill.level }}></div>
                                                        </div>
                                                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
                                                            {skill.level} Proficiency
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="premium-overlay">
                                                    <h3 style={{ marginBottom: '1rem', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '0.5rem' }}>
                                                        {skill.name}
                                                    </h3>
                                                    <p className="overlay-description">
                                                        {skill.description || `Experienced in ${skill.name} with a proficiency of ${skill.level}.`}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </section>
    );
};

export default Skills;
