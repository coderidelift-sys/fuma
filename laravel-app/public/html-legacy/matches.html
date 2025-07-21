<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Matches - Football Tournament Management</title>
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
        
        .team-logo-sm {
            width: 30px;
            height: 30px;
            object-fit: contain;
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
        
        .match-score {
            font-weight: bold;
            font-size: 1.1rem;
            background-color: #f8f9fa;
            padding: 2px 8px;
            border-radius: 5px;
        }
        
        .live-badge {
            animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
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
                        <a class="nav-link active" href="matches.html">Matches</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="players.html">Players</a>
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
                    <h1 class="fw-bold mb-3">All Matches</h1>
                </div>
                <div class="col-md-6 text-md-end">
                    <button class="btn btn-light" data-bs-toggle="modal" data-bs-target="#createMatchModal">
                        <i class="fas fa-plus me-2"></i> Add New Match
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
                        <label for="statusFilter" class="form-label">Match Status</label>
                        <select id="statusFilter" class="form-select">
                            <option value="">All Status</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="live">Live</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label for="tournamentFilter" class="form-label">Tournament</label>
                        <select id="tournamentFilter" class="form-select">
                            <option value="">All Tournaments</option>
                            <option value="premier_league">Premier League</option>
                            <option value="champions_cup">Champions Cup</option>
                            <option value="winter_tournament">Winter Tournament</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label for="dateFilter" class="form-label">Date Range</label>
                        <input type="date" class="form-control" id="dateFilter">
                    </div>
                    <div class="col-md-3 d-flex align-items-end">
                        <button class="btn btn-primary w-100" id="applyFilters">
                            <i class="fas fa-filter me-2"></i> Filter
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Matches Table -->
        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th>Match</th>
                                <th>Tournament</th>
                                <th>Date & Time</th>
                                <th>Venue</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Upcoming Match -->
                            <tr>
                                <td>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="text-end" style="width: 40%;">
                                            <div class="d-flex align-items-center justify-content-end">
                                                <span class="me-2">City FC</span>
                                                <img src="https://img.freepik.com/premium-vector/soccer-ball-icon-logo-template-football-logo-symbol_7649-4092.jpg?w=2000" alt="Team Logo" class="team-logo-sm">
                                            </div>
                                        </div>
                                        <div class="px-2 text-center">
                                            <div class="text-muted small">Jun 15, 15:00</div>
                                            <div class="match-score">VS</div>
                                        </div>
                                        <div class="text-start" style="width: 40%;">
                                            <div class="d-flex align-items-center">
                                                <img src="https://img.freepik.com/premium-vector/soccer-ball-icon-logo-template-football-logo-symbol_7649-4092.jpg?w=2000" alt="Team Logo" class="team-logo-sm me-2">
                                                <span>United SC</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>Premier League</td>
                                <td>Jun 15, 2023<br>15:00</td>
                                <td>National Stadium</td>
                                <td><span class="badge bg-primary badge-pill">Upcoming</span></td>
                                <td>
                                    <a href="match-detail.html" class="btn btn-sm btn-outline-primary action-btn">
                                        <i class="fas fa-eye"></i> View
                                    </a>
                                    <button class="btn btn-sm btn-outline-secondary action-btn">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                            
                            <!-- Live Match -->
                            <tr>
                                <td>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="text-end" style="width: 40%;">
                                            <div class="d-flex align-items-center justify-content-end">
                                                <span class="me-2">Dynamo FC</span>
                                                <img src="https://img.freepik.com/premium-vector/soccer-ball-icon-logo-template-football-logo-symbol_7649-4092.jpg?w=2000" alt="Team Logo" class="team-logo-sm">
                                            </div>
                                        </div>
                                        <div class="px-2 text-center">
                                            <div class="text-muted small">Live</div>
                                            <div class="match-score">2 - 1</div>
                                        </div>
                                        <div class="text-start" style="width: 40%;">
                                            <div class="d-flex align-items-center">
                                                <img src="https://img.freepik.com/premium-vector/soccer-ball-icon-logo-template-football-logo-symbol_7649-4092.jpg?w=2000" alt="Team Logo" class="team-logo-sm me-2">
                                                <span>Rovers FC</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>Champions Cup</td>
                                <td>Jun 14, 2023<br>18:30</td>
                                <td>City Arena</td>
                                <td><span class="badge bg-danger badge-pill live-badge">Live</span></td>
                                <td>
                                    <a href="match-detail.html" class="btn btn-sm btn-outline-primary action-btn">
                                        <i class="fas fa-eye"></i> View
                                    </a>
                                    <button class="btn btn-sm btn-outline-secondary action-btn">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                            
                            <!-- Completed Match -->
                            <tr>
                                <td>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="text-end" style="width: 40%;">
                                            <div class="d-flex align-items-center justify-content-end">
                                                <span class="me-2">Tigers SC</span>
                                                <img src="https://img.freepik.com/premium-vector/soccer-ball-icon-logo-template-football-logo-symbol_7649-4092.jpg?w=2000" alt="Team Logo" class="team-logo-sm">
                                            </div>
                                        </div>
                                        <div class="px-2 text-center">
                                            <div class="text-muted small">Jun 12, 14:00</div>
                                            <div class="match-score">1 - 1</div>
                                        </div>
                                        <div class="text-start" style="width: 40%;">
                                            <div class="d-flex align-items-center">
                                                <img src="https://img.freepik.com/premium-vector/soccer-ball-icon-logo-template-football-logo-symbol_7649-4092.jpg?w=2000" alt="Team Logo" class="team-logo-sm me-2">
                                                <span>Lions FC</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>Winter Tournament</td>
                                <td>Jun 12, 2023<br>14:00</td>
                                <td>Community Ground</td>
                                <td><span class="badge bg-secondary badge-pill">Completed</span></td>
                                <td>
                                    <a href="match-detail.html" class="btn btn-sm btn-outline-primary action-btn">
                                        <i class="fas fa-eye"></i> View
                                    </a>
                                    <button class="btn btn-sm btn-outline-secondary action-btn">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                            
                            <!-- Another Upcoming Match -->
                            <tr>
                                <td>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="text-end" style="width: 40%;">
                                            <div class="d-flex align-items-center justify-content-end">
                                                <span class="me-2">United SC</span>
                                                <img src="https://img.freepik.com/premium-vector/soccer-ball-icon-logo-template-football-logo-symbol_7649-4092.jpg?w=2000" alt="Team Logo" class="team-logo-sm">
                                            </div>
                                        </div>
                                        <div class="px-2 text-center">
                                            <div class="text-muted small">Jun 18, 16:00</div>
                                            <div class="match-score">VS</div>
                                        </div>
                                        <div class="text-start" style="width: 40%;">
                                            <div class="d-flex align-items-center">
                                                <img src="https://img.freepik.com/premium-vector/soccer-ball-icon-logo-template-football-logo-symbol_7649-4092.jpg?w=2000" alt="Team Logo" class="team-logo-sm me-2">
                                                <span>Dynamo FC</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>Premier League</td>
                                <td>Jun 18, 2023<br>16:00</td>
                                <td>National Stadium</td>
                                <td><span class="badge bg-primary badge-pill">Upcoming</span></td>
                                <td>
                                    <a href="match-detail.html" class="btn btn-sm btn-outline-primary action-btn">
                                        <i class="fas fa-eye"></i> View
                                    </a>
                                    <button class="btn btn-sm btn-outline-secondary action-btn">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                            
                            <!-- Another Completed Match -->
                            <tr>
                                <td>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="text-end" style="width: 40%;">
                                            <div class="d-flex align-items-center justify-content-end">
                                                <span class="me-2">Rovers FC</span>
                                                <img src="https://img.freepik.com/premium-vector/soccer-ball-icon-logo-template-football-logo-symbol_7649-4092.jpg?w=2000" alt="Team Logo" class="team-logo-sm">
                                            </div>
                                        </div>
                                        <div class="px-2 text-center">
                                            <div class="text-muted small">Jun 10, 13:00</div>
                                            <div class="match-score">3 - 2</div>
                                        </div>
                                        <div class="text-start" style="width: 40%;">
                                            <div class="d-flex align-items-center">
                                                <img src="https://img.freepik.com/premium-vector/soccer-ball-icon-logo-template-football-logo-symbol_7649-4092.jpg?w=2000" alt="Team Logo" class="team-logo-sm me-2">
                                                <span>Tigers SC</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>Champions Cup</td>
                                <td>Jun 10, 2023<br>13:00</td>
                                <td>City Arena</td>
                                <td><span class="badge bg-secondary badge-pill">Completed</span></td>
                                <td>
                                    <a href="match-detail.html" class="btn btn-sm btn-outline-primary action-btn">
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
                <nav aria-label="Matches pagination" class="mt-4">
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

    <!-- Create Match Modal -->
    <div class="modal fade" id="createMatchModal" tabindex="-1" aria-labelledby="createMatchModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="createMatchModalLabel">Add New Match</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="homeTeam" class="form-label">Home Team</label>
                                <select class="form-select" id="homeTeam" required>
                                    <option value="">Select team</option>
                                    <option value="city_fc">City FC</option>
                                    <option value="united_sc">United SC</option>
                                    <option value="dynamo_fc">Dynamo FC</option>
                                    <option value="rovers_fc">Rovers FC</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="awayTeam" class="form-label">Away Team</label>
                                <select class="form-select" id="awayTeam" required>
                                    <option value="">Select team</option>
                                    <option value="city_fc">City FC</option>
                                    <option value="united_sc">United SC</option>
                                    <option value="dynamo_fc">Dynamo FC</option>
                                    <option value="rovers_fc">Rovers FC</option>
                                </select>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="matchDate" class="form-label">Date</label>
                                <input type="date" class="form-control" id="matchDate" required>
                            </div>
                            <div class="col-md-6">
                                <label for="matchTime" class="form-label">Time</label>
                                <input type="time" class="form-control" id="matchTime" required>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="tournament" class="form-label">Tournament</label>
                                <select class="form-select" id="tournament" required>
                                    <option value="">Select tournament</option>
                                    <option value="premier_league">Premier League</option>
                                    <option value="champions_cup">Champions Cup</option>
                                    <option value="winter_tournament">Winter Tournament</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="stage" class="form-label">Stage</label>
                                <select class="form-select" id="stage" required>
                                    <option value="">Select stage</option>
                                    <option value="group">Group Stage</option>
                                    <option value="round_of_16">Round of 16</option>
                                    <option value="quarter_final">Quarter Final</option>
                                    <option value="semi_final">Semi Final</option>
                                    <option value="final">Final</option>
                                </select>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="venue" class="form-label">Venue</label>
                                <select class="form-select" id="venue" required>
                                    <option value="">Select venue</option>
                                    <option value="national_stadium">National Stadium</option>
                                    <option value="city_arena">City Arena</option>
                                    <option value="community_ground">Community Ground</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="referee" class="form-label">Referee</label>
                                <select class="form-select" id="referee" required>
                                    <option value="">Select referee</option>
                                    <option value="john_smith">John Smith</option>
                                    <option value="mike_johnson">Mike Johnson</option>
                                    <option value="david_wilson">David Wilson</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary">Save Match</button>
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
                const statusFilter = document.getElementById('statusFilter').value;
                const tournamentFilter = document.getElementById('tournamentFilter').value;
                const dateFilter = document.getElementById('dateFilter').value;
                
                // In a real application, you would send these filters to the server
                console.log('Applying filters:', {
                    status: statusFilter,
                    tournament: tournamentFilter,
                    date: dateFilter
                });
                
                // Show alert to simulate filtering (remove in production)
                alert('Filters applied! In a real application, this would filter the match data.');
            });
        });
    </script>
</body>
</html>