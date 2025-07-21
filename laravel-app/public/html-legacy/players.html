<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Players - Football Tournament Management</title>
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Custom CSS -->
       <style>
        :root {
    --primary-color: #2563eb;       /* New primary (lighter blue from gradient) */
    --secondary-color: #1e40af;    /* New secondary (darker blue from gradient) */
    --accent-color: #e74c3c;       /* Keeping the original accent color (red) */
    --light-color: #f8fafc;        /* Lighter background color */
    --dark-color: #1e293b;         /* Darker text color that complements the blues */
    
    /* Optional: You can add gradient variables if you'll reuse them */
    --blue-gradient: linear-gradient(135deg, #1e40af, #2563eb);
}
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
            color: var(--dark-color);
        }
        
        .navbar {
            background-color: var(--secondary-color);
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .page-header {
            background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
            color: white;
            padding: 3rem 0;
            margin-bottom: 2rem;
        }
        
        .table-responsive {
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        
        .table thead {
            background-color: var(--primary-color);
            color: white;
        }
        
        .table th {
            font-weight: 600;
        }
        
        .player-avatar {
            width: 40px;
            height: 40px;
            object-fit: cover;
            border-radius: 50%;
        }
        
        .filter-card {
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            margin-bottom: 20px;
        }
        
        .action-btn {
            padding: 5px 10px;
            font-size: 0.8rem;
        }
        
        .pagination .page-item.active .page-link {
            background-color: var(--primary-color);
            border-color: var(--primary-color);
        }
        
        .pagination .page-link {
            color: var(--primary-color);
        }
        
        .badge-pill {
            border-radius: 10px;
            padding: 5px 10px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .position-badge {
            display: inline-block;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            text-align: center;
            line-height: 24px;
            font-size: 0.7rem;
            font-weight: bold;
        }
        
        .badge-gk { background-color: #f39c12; color: white; }
        .badge-df { background-color: #27ae60; color: white; }
        .badge-mf { background-color: #3498db; color: white; }
        .badge-fw { background-color: #e74c3c; color: white; }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark sticky-top">
        <div class="container">
            <a class="navbar-brand" href="index.html">
                <i class="fas fa-futbol me-2"></i> FUMA
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="index.html">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="tournaments.html">Tournaments</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="teams.html">Teams</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="matches.html">Matches</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="players.html">Players</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#login" data-bs-toggle="modal" data-bs-target="#loginModal">
                            <i class="fas fa-sign-in-alt me-1"></i> Login
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Page Header -->
    <header class="page-header">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h1 class="fw-bold mb-3">All Players</h1>
                </div>
                <div class="col-md-6 text-md-end">
                    <button class="btn btn-light" data-bs-toggle="modal" data-bs-target="#createPlayerModal">
                        <i class="fas fa-plus me-2"></i> Add New Player
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <div class="container py-4">
        <!-- Filter Section -->
        <div class="filter-card card mb-4">
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-3">
                        <label for="searchPlayer" class="form-label">Search Player</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-search"></i></span>
                            <input type="text" class="form-control" id="searchPlayer" placeholder="Player name...">
                        </div>
                    </div>
                    <div class="col-md-2">
                        <label for="positionFilter" class="form-label">Position</label>
                        <select id="positionFilter" class="form-select">
                            <option value="">All Positions</option>
                            <option value="goalkeeper">Goalkeeper</option>
                            <option value="defender">Defender</option>
                            <option value="midfielder">Midfielder</option>
                            <option value="forward">Forward</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label for="teamFilter" class="form-label">Team</label>
                        <select id="teamFilter" class="form-select">
                            <option value="">All Teams</option>
                            <option value="city_fc">City FC</option>
                            <option value="united_sc">United SC</option>
                            <option value="dynamo_fc">Dynamo FC</option>
                            <option value="rovers_fc">Rovers FC</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label for="nationalityFilter" class="form-label">Nationality</label>
                        <select id="nationalityFilter" class="form-select">
                            <option value="">All Nationalities</option>
                            <option value="england">England</option>
                            <option value="spain">Spain</option>
                            <option value="germany">Germany</option>
                            <option value="france">France</option>
                        </select>
                    </div>
                    <div class="col-md-3 d-flex align-items-end">
                        <button class="btn btn-primary w-100" id="applyFilters">
                            <i class="fas fa-filter me-2"></i> Filter
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Players Table -->
        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th>Player</th>
                                <th>Position</th>
                                <th>Team</th>
                                <th>Nationality</th>
                                <th>Age</th>
                                <th>Goals</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Player 1 -->
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDM3hN-VCNh90Pop53o8bQ1L_W8kn4LhZf7Q&s" alt="Player" class="player-avatar me-3">
                                        <div>
                                            <h6 class="mb-0">John Smith</h6>
                                            <small class="text-muted">#9</small>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="position-badge badge-fw" title="Forward">FW</span>
                                </td>
                                <td>City FC</td>
                                <td>
                                    <img src="https://i.pinimg.com/474x/52/a1/28/52a12853824cd120f1465526dbe21404.jpg" alt="Flag" class="me-1" style="width:20px;">
                                    England
                                </td>
                                <td>25</td>
                                <td>12</td>
                                <td><span class="badge bg-success badge-pill">Active</span></td>
                                <td>
                                    <a href="player-detail.html" class="btn btn-sm btn-outline-primary action-btn">
                                        <i class="fas fa-eye"></i> View
                                    </a>
                                    <button class="btn btn-sm btn-outline-secondary action-btn">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                            
                            <!-- Player 2 -->
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDM3hN-VCNh90Pop53o8bQ1L_W8kn4LhZf7Q&s" alt="Player" class="player-avatar me-3">
                                        <div>
                                            <h6 class="mb-0">David Johnson</h6>
                                            <small class="text-muted">#8</small>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="position-badge badge-mf" title="Midfielder">MF</span>
                                </td>
                                <td>United SC</td>
                                <td>
                                    <img src="https://i.pinimg.com/474x/52/a1/28/52a12853824cd120f1465526dbe21404.jpg" alt="Flag" class="me-1" style="width:20px;">
                                    Spain
                                </td>
                                <td>28</td>
                                <td>5</td>
                                <td><span class="badge bg-success badge-pill">Active</span></td>
                                <td>
                                    <a href="player-detail.html" class="btn btn-sm btn-outline-primary action-btn">
                                        <i class="fas fa-eye"></i> View
                                    </a>
                                    <button class="btn btn-sm btn-outline-secondary action-btn">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                            
                            <!-- Player 3 -->
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDM3hN-VCNh90Pop53o8bQ1L_W8kn4LhZf7Q&s" alt="Player" class="player-avatar me-3">
                                        <div>
                                            <h6 class="mb-0">Michael Brown</h6>
                                            <small class="text-muted">#4</small>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="position-badge badge-df" title="Defender">DF</span>
                                </td>
                                <td>Dynamo FC</td>
                                <td>
                                    <img src="https://i.pinimg.com/474x/52/a1/28/52a12853824cd120f1465526dbe21404.jpg" alt="Flag" class="me-1" style="width:20px;">
                                    Germany
                                </td>
                                <td>30</td>
                                <td>2</td>
                                <td><span class="badge bg-success badge-pill">Active</span></td>
                                <td>
                                    <a href="player-detail.html" class="btn btn-sm btn-outline-primary action-btn">
                                        <i class="fas fa-eye"></i> View
                                    </a>
                                    <button class="btn btn-sm btn-outline-secondary action-btn">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                            
                            <!-- Player 4 -->
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDM3hN-VCNh90Pop53o8bQ1L_W8kn4LhZf7Q&s" alt="Player" class="player-avatar me-3">
                                        <div>
                                            <h6 class="mb-0">Robert Wilson</h6>
                                            <small class="text-muted">#1</small>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="position-badge badge-gk" title="Goalkeeper">GK</span>
                                </td>
                                <td>Rovers FC</td>
                                <td>
                                    <img src="https://i.pinimg.com/474x/52/a1/28/52a12853824cd120f1465526dbe21404.jpg" alt="Flag" class="me-1" style="width:20px;">
                                    France
                                </td>
                                <td>32</td>
                                <td>0</td>
                                <td><span class="badge bg-success badge-pill">Active</span></td>
                                <td>
                                    <a href="player-detail.html" class="btn btn-sm btn-outline-primary action-btn">
                                        <i class="fas fa-eye"></i> View
                                    </a>
                                    <button class="btn btn-sm btn-outline-secondary action-btn">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                            
                            <!-- Player 5 -->
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDM3hN-VCNh90Pop53o8bQ1L_W8kn4LhZf7Q&s" alt="Player" class="player-avatar me-3">
                                        <div>
                                            <h6 class="mb-0">James Taylor</h6>
                                            <small class="text-muted">#10</small>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="position-badge badge-fw" title="Forward">FW</span>
                                </td>
                                <td>City FC</td>
                                <td>
                                    <img src="https://i.pinimg.com/474x/52/a1/28/52a12853824cd120f1465526dbe21404.jpg" alt="Flag" class="me-1" style="width:20px;">
                                    England
                                </td>
                                <td>27</td>
                                <td>8</td>
                                <td><span class="badge bg-warning badge-pill">Injured</span></td>
                                <td>
                                    <a href="player-detail.html" class="btn btn-sm btn-outline-primary action-btn">
                                        <i class="fas fa-eye"></i> View
                                    </a>
                                    <button class="btn btn-sm btn-outline-secondary action-btn">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                            
                            <!-- Player 6 -->
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDM3hN-VCNh90Pop53o8bQ1L_W8kn4LhZf7Q&s" alt="Player" class="player-avatar me-3">
                                        <div>
                                            <h6 class="mb-0">Paul White</h6>
                                            <small class="text-muted">#6</small>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="position-badge badge-mf" title="Midfielder">MF</span>
                                </td>
                                <td>United SC</td>
                                <td>
                                    <img src="https://i.pinimg.com/474x/52/a1/28/52a12853824cd120f1465526dbe21404.jpg" alt="Flag" class="me-1" style="width:20px;">
                                    Spain
                                </td>
                                <td>29</td>
                                <td>3</td>
                                <td><span class="badge bg-success badge-pill">Active</span></td>
                                <td>
                                    <a href="player-detail.html" class="btn btn-sm btn-outline-primary action-btn">
                                        <i class="fas fa-eye"></i> View
                                    </a>
                                    <button class="btn btn-sm btn-outline-secondary action-btn">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                <nav aria-label="Players pagination" class="mt-4">
                    <ul class="pagination justify-content-center">
                        <li class="page-item disabled">
                            <a class="page-link" href="#" tabindex="-1">Previous</a>
                        </li>
                        <li class="page-item active"><a class="page-link" href="#">1</a></li>
                        <li class="page-item"><a class="page-link" href="#">2</a></li>
                        <li class="page-item"><a class="page-link" href="#">3</a></li>
                        <li class="page-item">
                            <a class="page-link" href="#">Next</a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>

    <!-- Create Player Modal -->
    <div class="modal fade" id="createPlayerModal" tabindex="-1" aria-labelledby="createPlayerModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="createPlayerModalLabel">Add New Player</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="mb-3">
                            <label for="playerPhoto" class="form-label">Photo</label>
                            <input class="form-control" type="file" id="playerPhoto">
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="firstName" class="form-label">First Name</label>
                                <input type="text" class="form-control" id="firstName" required>
                            </div>
                            <div class="col-md-6">
                                <label for="lastName" class="form-label">Last Name</label>
                                <input type="text" class="form-control" id="lastName" required>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-4">
                                <label for="playerTeam" class="form-label">Team</label>
                                <select class="form-select" id="playerTeam" required>
                                    <option value="">Select team</option>
                                    <option value="city_fc">City FC</option>
                                    <option value="united_sc">United SC</option>
                                    <option value="dynamo_fc">Dynamo FC</option>
                                    <option value="rovers_fc">Rovers FC</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label for="playerNumber" class="form-label">Jersey Number</label>
                                <input type="number" class="form-control" id="playerNumber" min="1" max="99">
                            </div>
                            <div class="col-md-4">
                                <label for="playerPosition" class="form-label">Position</label>
                                <select class="form-select" id="playerPosition" required>
                                    <option value="">Select position</option>
                                    <option value="goalkeeper">Goalkeeper</option>
                                    <option value="defender">Defender</option>
                                    <option value="midfielder">Midfielder</option>
                                    <option value="forward">Forward</option>
                                </select>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="playerNationality" class="form-label">Nationality</label>
                                <select class="form-select" id="playerNationality" required>
                                    <option value="">Select nationality</option>
                                    <option value="england">England</option>
                                    <option value="spain">Spain</option>
                                    <option value="germany">Germany</option>
                                    <option value="france">France</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="playerBirthdate" class="form-label">Birthdate</label>
                                <input type="date" class="form-control" id="playerBirthdate">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="playerBio" class="form-label">Bio</label>
                            <textarea class="form-control" id="playerBio" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary">Save Player</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap 5 JS Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Custom JS for filtering -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Filter functionality
            document.getElementById('applyFilters').addEventListener('click', function() {
                const searchTerm = document.getElementById('searchPlayer').value;
                const positionFilter = document.getElementById('positionFilter').value;
                const teamFilter = document.getElementById('teamFilter').value;
                const nationalityFilter = document.getElementById('nationalityFilter').value;
                
                // In a real application, you would send these filters to the server
                console.log('Applying filters:', {
                    search: searchTerm,
                    position: positionFilter,
                    team: teamFilter,
                    nationality: nationalityFilter
                });
                
                // Show alert to simulate filtering (remove in production)
                alert('Filters applied! In a real application, this would filter the player data.');
            });
        });
    </script>
</body>
</html>