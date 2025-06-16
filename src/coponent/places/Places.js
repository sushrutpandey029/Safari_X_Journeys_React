import React from 'react'
import './Places.css'


const travelData = [
    {
        image: './images/place1.jpg',
        title: 'MANALI',
        duration: '5 Days Manali',
        icons: ['bi-people', 'bi-house-door', 'bi-car-front'],
    },
    {
        image: './images/place2.png',
        title: 'KASOL',
        duration: '2 Days Kasol',
        icons: ['bi-house-door', 'bi-camera', 'bi-car-front'],
    },
    {
        image: './images/place3.jpg',
        title: 'SHIMLA',
        duration: '7 Days Shimla',
        icons: ['bi-camera', 'bi-house-door', 'bi-car-front'],
    },
    {
        image: './images/place2.png',
        title: 'SHIMLA',
        duration: '7 Days Shimla',
        icons: ['bi-camera', 'bi-house-door', 'bi-car-front'],
    },
];




function Places() {
    return (
        <div className='place-box'>
            <div className="container py-5">
                <div className='row mb-4'>
                    <div className='col-sm-8'>
                        <h2>Check-in for Your Chill Mood</h2>
                        <p>Easy picks for your perfect weekend break</p>
                    </div>
                    <div className='col-sm-4'>
                        <form>
                            <div class="search-container">
                                <div class="search-input">
                                    <i class="bi bi-search"></i>
                                    <input placeholder="Find Place And Things To Do" type="text" />
                                </div>
                                <button class="explore-btn">Search</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="row g-4">
                    {travelData.map((place, index) => (
                        <div className="col-md-3" key={index}>
                            <div className="card h-100 shadow-sm rounded-4 border">
                                <img src={place.image} className="card-img-top rounded-top-4" alt={place.title} />
                                <div className="card-body">
                                    <h5 className="fw-bold">{place.title}</h5>
                                    <p className="text-muted mb-2">{place.duration}</p>

                                    <div className="d-flex gap-3 mb-3 fs-5 text-dark">
                                        {place.icons.map((icon, i) => (
                                            <i className={`bi ${icon}`} key={i}></i>
                                        ))}
                                    </div>

                                    <ul className="list-unstyled text-muted small mb-3">
                                        <li><i className="bi bi-check text-primary me-2"></i> Lorem Ipsum Dolor Sit Amet Consectetur</li>
                                        <li><i className="bi bi-check text-primary me-2"></i> Lorem Ipsum Dolor Sit Amet Consectetur</li>
                                    </ul>

                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <span className="text-muted small">Starting From</span><br />
                                            <strong className="fs-5">₹8,000</strong>
                                        </div>
                                        <button className="explore-btn">View Package</button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
}

export default Places