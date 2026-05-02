import { ExternalLink } from 'lucide-react';

const wishlist = [
  {
    id: 1,
    name: 'Sony WH-1000XM5 Wireless Headphones',
    price: '$398.00',
    link: 'https://www.sony.com',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=600',
    description: 'Industry-leading noise canceling headphones.',
  },
  {
    id: 2,
    name: 'Logitech MX Master 3S',
    price: '$99.99',
    link: 'https://www.logitech.com',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=600',
    description: 'Advanced wireless mouse for precision and comfort.',
  },
  {
    id: 3,
    name: 'Leica Q3 Camera',
    price: '$5,995.00',
    link: 'https://leica-camera.com',
    image: 'https://images.unsplash.com/photo-1516961642265-531546e84af2?auto=format&fit=crop&q=80&w=600',
    description: 'Compact digital camera with full-frame sensor.',
  },
  {
    id: 4,
    name: 'Herman Miller Aeron Chair',
    price: '$1,805.00',
    link: 'https://store.hermanmiller.com',
    image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=600',
    description: 'Ergonomic office chair for ultimate workspace comfort.',
  }
];

const Birthday = () => {
  return (
    <div className="birthday-container">
      <header className="birthday-header">
        <h1>Birthday Wishlist</h1>
        <p>A minimal collection of things I want to get and see.</p>
      </header>
      
      <div className="wishlist-grid">
        {wishlist.map((item) => (
          <div key={item.id} className="wishlist-card">
            <div className="image-container">
              <img src={item.image} alt={item.name} loading="lazy" />
            </div>
            <div className="card-content">
              <div className="card-header">
                <h2>{item.name}</h2>
                <span className="price">{item.price}</span>
              </div>
              <p className="description">{item.description}</p>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="link-button">
                View Item <ExternalLink size={16} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Birthday;
