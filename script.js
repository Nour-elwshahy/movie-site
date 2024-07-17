const apiKey = '12bb1d177e3b73d3b6b1470683a91a24';
const baseUrl = 'https://api.themoviedb.org/3';

function setPrimaryColor(color) {
    document.documentElement.style.setProperty('--primary-color', color);
    localStorage.setItem('primary-color', color);
}

function loadPrimaryColor() {
    const savedColor = localStorage.getItem('primary-color');
    if (savedColor) {
        setPrimaryColor(savedColor);
    }
}

async function fetchMovies(category = 'now_playing') {
        try {
            const response = await fetch(`${baseUrl}/movie/${category}?api_key=${apiKey}`);
            const data = await response.json();
            displayMovies(data.results);
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    }
    
    function displayMovies(movies) {
        const movieContainer = document.getElementById('movie-container');
        movieContainer.innerHTML = '';
    
        movies.forEach(async (movie) => {
            const movieElement = document.createElement('div');
            movieElement.classList.add('movie');
            movieElement.setAttribute('data-id', movie.id);
            movieElement.setAttribute('data-poster', movie.poster_path);
    
            // Fetch images
            const images = await fetchMovieImages(movie.id);
            const backdropPath = images.backdrops && images.backdrops.length > 1
                ? `https://image.tmdb.org/t/p/w500${images.backdrops[1].file_path}`
                : `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    
            movieElement.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                <div class="movie-details">
                    <h3>${movie.title}</h3>
                    <p>${movie.overview}</p>
                </div>
            `;
    
            movieElement.addEventListener('mouseover', () => {
                const img = movieElement.querySelector('img');
                img.style.opacity = 0.5; 
                img.src = backdropPath;
            });
    
            movieElement.addEventListener('mouseout', () => {
                const img = movieElement.querySelector('img');
                img.style.opacity = 1; // smooth transition
                img.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
            });
    
            movieContainer.appendChild(movieElement);
        });
    }
    
    async function fetchMovieImages(movieId) {
        try {
            const response = await fetch(`${baseUrl}/movie/${movieId}/images?api_key=${apiKey}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching movie images:', error);
            return {};
        }
    }
    
    function showMovieDetails(movie) {
        const popup = document.getElementById('popup');
        const popupContent = document.getElementById('popup-content');
        popupContent.innerHTML = `
            <h2>${movie.title}</h2>
            <p>${movie.overview}</p>
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        `;
        popup.style.display = 'block';
    }
    
    function closePopup() {
        const popup = document.getElementById('popup');
        popup.style.display = 'none';
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        loadPrimaryColor();
        fetchMovies();
    
        document.querySelectorAll('#sidebar a[data-category]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.getAttribute('data-category');
                fetchMovies(category);
            });
        });
    
        const movieContainer = document.getElementById('movie-container');
        movieContainer.addEventListener('mouseover', async (e) => {
            if (e.target.tagName === 'IMG') {
                const movieElement = e.target.closest('.movie');
                const movieId = movieElement.getAttribute('data-id');
                const images = await fetchMovieImages(movieId);
                const backdropPath = images.backdrops && images.backdrops.length > 1
                    ? `https://image.tmdb.org/t/p/w500${images.backdrops[1].file_path}`
                    : `https://image.tmdb.org/t/p/w500${e.target.src.split('/').pop()}`;
    
                e.target.src = backdropPath;
            }
        });
    
        movieContainer.addEventListener('mouseout', (e) => {
            if (e.target.tagName === 'IMG') {
                const movieElement = e.target.closest('.movie');
                e.target.src = `https://image.tmdb.org/t/p/w500${movieElement.getAttribute('data-poster')}`;
            }
        });
    
        const searchInput = document.getElementById('search-input');
        let timeout = null;
        searchInput.addEventListener('keyup', () => {
            clearTimeout(timeout);
            if (searchInput.value.length >= 3) {
                timeout = setTimeout(() => {
                    searchMovies(searchInput.value);
                }, 300);
            }
        });
    
        async function searchMovies(query) {
            try {
                const response = await fetch(`${baseUrl}/search/movie?api_key=${apiKey}&query=${query}`);
                const data = await response.json();
                displaySearchResults(data.results);
            } catch (error) {
                console.error('Error searching movies:', error);
            }
        }
    
        function displaySearchResults(results) {
            const searchResults = document.getElementById('search-results');
            searchResults.innerHTML = '';
            if (results.length === 0) {
                searchResults.innerHTML = '<p>No results found. <button onclick="fetchMovies()">Go back to home</button></p>';
            } else {
                results.forEach(result => {
                    const resultElement = document.createElement('div');
                    resultElement.classList.add('movie');
                    resultElement.innerHTML = `
                        <img src="https://image.tmdb.org/t/p/w500${result.poster_path}" alt="${result.title}">
                    `;
                    resultElement.addEventListener('click', () => showMovieDetails(result));
                    searchResults.appendChild(resultElement);
                });
            }
        }
    
        // Contact form validation
        const contactForm = document.getElementById('contact-form');
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            validateForm();
        });
    
        function validateForm() {
            let isValid = true;
    
            // Name validation
            const name = document.getElementById('name');
            const nameError = document.getElementById('name-error');
            if (name.value.trim() === '') {
                name.classList.add('invalid');
                nameError.textContent = 'Name is required.';
                isValid = false;
            } else {
                name.classList.remove('invalid');
                nameError.textContent = '';
            }
    
            // Email validation
            const email = document.getElementById('email');
            const emailError = document.getElementById('email-error');
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email.value)) {
                email.classList.add('invalid');
                emailError.textContent = 'Invalid email address.';
                isValid = false;
            } else {
                email.classList.remove('invalid');
                emailError.textContent = '';
            }
    
            // Phone validation
            const phone = document.getElementById('phone');
            const phoneError = document.getElementById('phone-error');
            const phonePattern = /^\d{10}$/;
            if (!phonePattern.test(phone.value)) {
                phone.classList.add('invalid');
                phoneError.textContent = 'Phone number must be 10 digits.';
                isValid = false;
            } else {
                phone.classList.remove('invalid');
                phoneError.textContent = '';
            }
    
            // Age validation
            const age = document.getElementById('age');
            const ageError = document.getElementById('age-error');
            if (isNaN(age.value) || age.value <= 0) {
                age.classList.add('invalid');
                ageError.textContent = 'Age must be a positive number.';
                isValid = false;
            } else {
                age.classList.remove('invalid');
                ageError.textContent = '';
            }
    
        // Password validation
        const password = document.getElementById('password');
        const passwordError = document.getElementById('password-error');
        if (password.value.length < 6) {
            password.classList.add('invalid');
            passwordError.textContent = 'Password must be at least 6 characters long.';
            isValid = false;
        } else {
            password.classList.remove('invalid');
            passwordError.textContent = '';
        }

            // Confirm Password validation
            const confirmPassword = document.getElementById('confirm-password');
            const confirmPasswordError = document.getElementById('confirm-password-error');
            if (confirmPassword.value !== password.value) {
                confirmPassword.classList.add('invalid');
                confirmPasswordError.textContent = 'Passwords do not match.';
                isValid = false;
            } else {
                confirmPassword.classList.remove('invalid');
                confirmPasswordError.textContent = '';
            }
    
            if (isValid) {
                document.getElementById('form-messages').innerHTML = '<p>Form submitted successfully!</p>';
                // contactForm.submit();
            }
        }
    });