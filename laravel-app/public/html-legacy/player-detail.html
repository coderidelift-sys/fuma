<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Player Details - Football Tournament Management</title>
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Custom CSS -->
    <style>
        :root {
            --primary-color: #2563eb;
            --secondary-color: #1e40af;
            --accent-color: #e74c3c;
            --light-color: #f8fafc;
            --dark-color: #1e293b;
            --blue-gradient: linear-gradient(135deg, #1e40af, #2563eb);
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--light-color);
            color: var(--dark-color);
        }
        
        /* Updated Navbar with Gradient */
        .navbar {
            background: var(--blue-gradient);
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .navbar-brand {
            font-weight: 700;
            color: white !important;
        }
        
        .navbar-nav .nav-link {
            color: rgba(255, 255, 255, 0.9) !important;
            transition: all 0.3s ease;
            padding: 0.5rem 1rem;
        }
        
        .navbar-nav .nav-link:hover,
        .navbar-nav .nav-link.active {
            color: white !important;
            transform: translateY(-2px);
        }
        
        .page-header {
            background: var(--blue-gradient);
            color: white;
            padding: 3rem 0;
            margin-bottom: 2rem;
        }
        
        .player-profile-card {
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            transition: transform 0.3s;
            border: none;
        }
        
        .player-profile-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .player-avatar-lg {
            width: 150px;
            height: 150px;
            object-fit: cover;
            border-radius: 50%;
            border: 5px solid white;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .player-avatar-lg:hover {
            transform: scale(1.05);
        }
        
        .position-badge-lg {
            display: inline-block;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            text-align: center;
            line-height: 40px;
            font-size: 1rem;
            font-weight: bold;
            transition: transform 0.2s;
        }
        
        .position-badge-lg:hover {
            transform: scale(1.1);
        }
        
        .badge-gk { background-color: #f59e0b; color: white; }
        .badge-df { background-color: #10b981; color: white; }
        .badge-mf { background-color: #3b82f6; color: white; }
        .badge-fw { background-color: #ef4444; color: white; }
        
        .stat-card {
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            transition: transform 0.3s;
            border-left: 3px solid var(--primary-color);
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: var(--primary-color);
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: var(--dark-color);
            opacity: 0.8;
        }
        
        .progress {
            height: 10px;
            border-radius: 5px;
        }
        
        .progress-bar {
            background-color: var(--primary-color);
        }
        
        .skill-badge {
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
            margin-right: 5px;
            margin-bottom: 5px;
            display: inline-block;
            transition: all 0.2s;
        }
        
        .skill-badge:hover {
            transform: translateY(-2px);
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .timeline {
            position: relative;
            padding-left: 30px;
        }
        
        .timeline::before {
            content: '';
            position: absolute;
            left: 10px;
            top: 0;
            bottom: 0;
            width: 2px;
            background-color: #e9ecef;
        }
        
        .timeline-item {
            position: relative;
            padding-bottom: 20px;
            transition: all 0.3s ease;
        }
        
        .timeline-item:hover {
            background-color: rgba(241, 245, 249, 0.5);
            border-radius: 8px;
            padding: 10px;
        }
        
        .timeline-item::before {
            content: '';
            position: absolute;
            left: -30px;
            top: 5px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: var(--primary-color);
            border: 2px solid white;
            z-index: 1;
        }
        
        .tab-content {
            padding: 20px;
            background-color: white;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        
        .nav-tabs {
            border-bottom: 2px solid #e9ecef;
        }
        
        .nav-tabs .nav-link.active {
            font-weight: 600;
            color: var(--primary-color);
            border-color: var(--primary-color) var(--primary-color) white;
        }
        
        .nav-tabs .nav-link {
            color: var(--dark-color);
            transition: all 0.3s;
        }
        
        .nav-tabs .nav-link:hover {
            border-color: #e9ecef #e9ecef #dee2e6;
            color: var(--primary-color);
        }
    </style>
</head>
<body>
    <!-- Navigation with Gradient -->
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
                    <h1 class="fw-bold mb-3">Player Details</h1>
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a href="index.html">Home</a></li>
                            <li class="breadcrumb-item"><a href="players.html">Players</a></li>
                            <li class="breadcrumb-item active" aria-current="page">John Smith</li>
                        </ol>
                    </nav>
                </div>
                <div class="col-md-6 text-md-end">
                   <button class="btn btn-light me-2" data-bs-toggle="modal" data-bs-target="#editProfileModal">
  <i class="fas fa-edit me-2"></i> Edit Profile
</button>

                    <button class="btn btn-light">
                        <i class="fas fa-arrow-left me-2"></i> Back to Players
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <div class="container py-4">
        <div class="row">
            <!-- Player Profile Column -->
            <div class="col-lg-4 mb-4">
                <div class="player-profile-card card">
                    <div class="card-body text-center">
                        <div class="position-relative mb-4">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDM3hN-VCNh90Pop53o8bQ1L_W8kn4LhZf7Q&s" 
                                 alt="Player" class="player-avatar-lg mb-3">
                            <span class="position-badge-lg badge-fw" title="Forward">FW</span>
                        </div>
                        <h3 class="mb-1">John Smith</h3>
                        <div class="d-flex justify-content-center align-items-center mb-3">
                            <img src="https://i.pinimg.com/474x/52/a1/28/52a12853824cd120f1465526dbe21404.jpg" 
                                 alt="Flag" style="width:24px; margin-right:10px;">
                            <h5 class="mb-0 text-muted">England</h5>
                        </div>
                        <div class="d-flex justify-content-center mb-4">
                            <div class="text-center me-4">
                                <h4 class="mb-0">#9</h4>
                                <small class="text-muted">Number</small>
                            </div>
                            <div class="text-center me-4">
                                <h4 class="mb-0">25</h4>
                                <small class="text-muted">Age</small>
                            </div>
                            <div class="text-center">
                                <h4 class="mb-0">1.85m</h4>
                                <small class="text-muted">Height</small>
                            </div>
                        </div>
                        <div class="d-flex justify-content-center mb-3">
                            <span class="badge bg-success badge-pill">
                                <i class="fas fa-check-circle me-1"></i> Active
                            </span>
                        </div>
                        <hr>
                        <h5 class="mb-3">City FC</h5>
                        <div class="d-flex justify-content-center">
                            <button class="btn btn-primary me-2">
                                <i class="fas fa-envelope me-1"></i> Contact
                            </button>
                            <button class="btn btn-outline-secondary">
                                <i class="fas fa-share-alt me-1"></i> Share
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Player Stats -->
                <div class="card mt-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Season Statistics</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-6 mb-3">
                                <div class="stat-card p-3 text-center">
                                    <div class="stat-value">12</div>
                                    <div class="stat-label">Goals</div>
                                </div>
                            </div>
                            <div class="col-6 mb-3">
                                <div class="stat-card p-3 text-center">
                                    <div class="stat-value">7</div>
                                    <div class="stat-label">Assists</div>
                                </div>
                            </div>
                            <div class="col-6 mb-3">
                                <div class="stat-card p-3 text-center">
                                    <div class="stat-value">24</div>
                                    <div class="stat-label">Matches</div>
                                </div>
                            </div>
                            <div class="col-6 mb-3">
                                <div class="stat-card p-3 text-center">
                                    <div class="stat-value">1,890'</div>
                                    <div class="stat-label">Minutes</div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="stat-card p-3 text-center">
                                    <div class="stat-value">4</div>
                                    <div class="stat-label">Yellow Cards</div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="stat-card p-3 text-center">
                                    <div class="stat-value">0</div>
                                    <div class="stat-label">Red Cards</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Player Details Column -->
            <div class="col-lg-8">
                <div class="card">
                    <div class="card-header bg-white">
                        <ul class="nav nav-tabs card-header-tabs">
                            <li class="nav-item">
                                <a class="nav-link active" data-bs-toggle="tab" href="#overview">Overview</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" data-bs-toggle="tab" href="#stats">Statistics</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" data-bs-toggle="tab" href="#matches">Matches</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" data-bs-toggle="tab" href="#career">Career</a>
                            </li>
                        </ul>
                    </div>
                    <div class="tab-content">
                        <!-- Overview Tab -->
                        <div class="tab-pane fade show active" id="overview">
                            <h4 class="mb-4">About John Smith</h4>
                            <p class="mb-4">
                                John Smith is a professional footballer who plays as a forward for City FC. 
                                Known for his clinical finishing and excellent positioning, he has been a 
                                key player for his team since joining in 2020. With 12 goals this season, 
                                he's currently the team's top scorer.
                            </p>
                            
                            <h5 class="mb-3">Skills & Attributes</h5>
                            <div class="mb-4">
                                <div class="mb-3">
                                    <label class="form-label">Shooting <span class="float-end">88%</span></label>
                                    <div class="progress">
                                        <div class="progress-bar bg-danger" style="width: 88%"></div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Dribbling <span class="float-end">75%</span></label>
                                    <div class="progress">
                                        <div class="progress-bar bg-primary" style="width: 75%"></div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Passing <span class="float-end">68%</span></label>
                                    <div class="progress">
                                        <div class="progress-bar bg-info" style="width: 68%"></div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Physical <span class="float-end">82%</span></label>
                                    <div class="progress">
                                        <div class="progress-bar bg-warning" style="width: 82%"></div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Speed <span class="float-end">90%</span></label>
                                    <div class="progress">
                                        <div class="progress-bar bg-success" style="width: 90%"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <h5 class="mb-3">Player Traits</h5>
                            <div class="mb-4">
                                <span class="skill-badge bg-primary">Clinical Finisher</span>
                                <span class="skill-badge bg-success">Speed Dribbler</span>
                                <span class="skill-badge bg-info">First Touch</span>
                                <span class="skill-badge bg-warning">Aerial Threat</span>
                                <span class="skill-badge bg-danger">Long Shots</span>
                            </div>
                            
                            <h5 class="mb-3">Personal Information</h5>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label text-muted">Full Name</label>
                                    <p>John Michael Smith</p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label text-muted">Date of Birth</label>
                                    <p>June 15, 1998 (25 years)</p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label text-muted">Place of Birth</label>
                                    <p>London, England</p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label text-muted">Nationality</label>
                                    <p>English</p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label text-muted">Height</label>
                                    <p>1.85 m (6 ft 1 in)</p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label text-muted">Weight</label>
                                    <p>78 kg (172 lbs)</p>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-muted">Preferred Foot</label>
                                    <p>Right</p>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-muted">Market Value</label>
                                    <p>€35 million</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Statistics Tab -->
                        <div class="tab-pane fade" id="stats">
                            <h4 class="mb-4">Season Statistics</h4>
                            <div class="table-responsive">
                                <table class="table table-bordered">
                                    <thead class="bg-light">
                                        <tr>
                                            <th>Competition</th>
                                            <th>Matches</th>
                                            <th>Goals</th>
                                            <th>Assists</th>
                                            <th>Yellow</th>
                                            <th>Red</th>
                                            <th>Minutes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Premier League</td>
                                            <td>20</td>
                                            <td>10</td>
                                            <td>5</td>
                                            <td>3</td>
                                            <td>0</td>
                                            <td>1,560'</td>
                                        </tr>
                                        <tr>
                                            <td>Champions League</td>
                                            <td>6</td>
                                            <td>2</td>
                                            <td>2</td>
                                            <td>1</td>
                                            <td>0</td>
                                            <td>480'</td>
                                        </tr>
                                        <tr>
                                            <td>FA Cup</td>
                                            <td>2</td>
                                            <td>0</td>
                                            <td>0</td>
                                            <td>0</td>
                                            <td>0</td>
                                            <td>120'</td>
                                        </tr>
                                        <tr class="fw-bold">
                                            <td>Total</td>
                                            <td>28</td>
                                            <td>12</td>
                                            <td>7</td>
                                            <td>4</td>
                                            <td>0</td>
                                            <td>2,160'</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <h5 class="mt-5 mb-3">Performance Chart</h5>
                            <div class="text-center py-4 bg-light rounded">
                                <p class="text-muted">
                                    <i class="fas fa-chart-line me-2"></i> Performance chart would be displayed here
                                </p>
                            </div>
                            
                            <h5 class="mt-5 mb-3">Career Statistics</h5>
                            <div class="table-responsive">
                                <table class="table table-bordered">
                                    <thead class="bg-light">
                                        <tr>
                                            <th>Season</th>
                                            <th>Team</th>
                                            <th>Matches</th>
                                            <th>Goals</th>
                                            <th>Assists</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>2023-24</td>
                                            <td>City FC</td>
                                            <td>28</td>
                                            <td>12</td>
                                            <td>7</td>
                                        </tr>
                                        <tr>
                                            <td>2022-23</td>
                                            <td>City FC</td>
                                            <td>35</td>
                                            <td>18</td>
                                            <td>9</td>
                                        </tr>
                                        <tr>
                                            <td>2021-22</td>
                                            <td>City FC</td>
                                            <td>30</td>
                                            <td>14</td>
                                            <td>6</td>
                                        </tr>
                                        <tr>
                                            <td>2020-21</td>
                                            <td>City FC</td>
                                            <td>25</td>
                                            <td>8</td>
                                            <td>4</td>
                                        </tr>
                                        <tr>
                                            <td>2019-20</td>
                                            <td>Academy</td>
                                            <td>20</td>
                                            <td>15</td>
                                            <td>10</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <!-- Matches Tab -->
                        <div class="tab-pane fade" id="matches">
                            <h4 class="mb-4">Recent Matches</h4>
                            <div class="list-group">
                                <a href="#" class="list-group-item list-group-item-action">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h5 class="mb-1">City FC 3-1 United SC</h5>
                                        <small class="text-muted">May 15, 2024</small>
                                    </div>
                                    <div class="d-flex align-items-center mt-2">
                                        <span class="badge bg-success me-3">Played</span>
                                        <span class="me-3"><strong>1</strong> goal</span>
                                        <span><strong>1</strong> assist</span>
                                    </div>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h5 class="mb-1">Dynamo FC 0-2 City FC</h5>
                                        <small class="text-muted">May 8, 2024</small>
                                    </div>
                                    <div class="d-flex align-items-center mt-2">
                                        <span class="badge bg-success me-3">Played</span>
                                        <span class="me-3"><strong>2</strong> goals</span>
                                        <span><strong>0</strong> assists</span>
                                    </div>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h5 class="mb-1">City FC 1-1 Rovers FC</h5>
                                        <small class="text-muted">May 1, 2024</small>
                                    </div>
                                    <div class="d-flex align-items-center mt-2">
                                        <span class="badge bg-success me-3">Played</span>
                                        <span class="me-3"><strong>0</strong> goals</span>
                                        <span><strong>1</strong> assist</span>
                                    </div>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h5 class="mb-1">City FC 0-0 Athletic FC</h5>
                                        <small class="text-muted">April 24, 2024</small>
                                    </div>
                                    <div class="d-flex align-items-center mt-2">
                                        <span class="badge bg-success me-3">Played</span>
                                        <span class="me-3"><strong>0</strong> goals</span>
                                        <span><strong>0</strong> assists</span>
                                    </div>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h5 class="mb-1">City FC 2-3 Champions FC</h5>
                                        <small class="text-muted">April 17, 2024</small>
                                    </div>
                                    <div class="d-flex align-items-center mt-2">
                                        <span class="badge bg-success me-3">Played</span>
                                        <span class="me-3"><strong>1</strong> goal</span>
                                        <span><strong>0</strong> assists</span>
                                    </div>
                                </a>
                            </div>
                            
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
                        
                        <!-- Career Tab -->
                        <div class="tab-pane fade" id="career">
                            <h4 class="mb-4">Career History</h4>
                            <div class="timeline">
                                <div class="timeline-item mb-4">
                                    <h5>City FC</h5>
                                    <p class="text-muted mb-1">2020 - Present</p>
                                    <p>
                                        Joined the first team after impressive performances in the academy. 
                                        Quickly established himself as a key player and fan favorite.
                                    </p>
                                </div>
                                <div class="timeline-item mb-4">
                                    <h5>City FC Academy</h5>
                                    <p class="text-muted mb-1">2018 - 2020</p>
                                    <p>
                                        Scored 15 goals in 20 matches in his final academy season, earning 
                                        a promotion to the first team.
                                    </p>
                                </div>
                                <div class="timeline-item mb-4">
                                    <h5>London Youth FC</h5>
                                    <p class="text-muted mb-1">2015 - 2018</p>
                                    <p>
                                        Played for local youth team where he was scouted by City FC. 
                                        Won the Youth Player of the Year award in 2017.
                                    </p>
                                </div>
                                <div class="timeline-item">
                                    <h5>School Football</h5>
                                    <p class="text-muted mb-1">Before 2015</p>
                                    <p>
                                        Showed early promise in school competitions, scoring regularly 
                                        for his school team.
                                    </p>
                                </div>
                            </div>
                            
                            <h4 class="mt-5 mb-4">Achievements</h4>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <div class="card">
                                        <div class="card-body">
                                            <div class="d-flex align-items-center">
                                                <div class="bg-primary bg-opacity-10 p-3 rounded me-3">
                                                    <i class="fas fa-trophy text-primary"></i>
                                                </div>
                                                <div>
                                                    <h5 class="mb-0">Premier League</h5>
                                                    <p class="text-muted mb-0">2022-23 Season</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="card">
                                        <div class="card-body">
                                            <div class="d-flex align-items-center">
                                                <div class="bg-success bg-opacity-10 p-3 rounded me-3">
                                                    <i class="fas fa-medal text-success"></i>
                                                </div>
                                                <div>
                                                    <h5 class="mb-0">Top Scorer</h5>
                                                    <p class="text-muted mb-0">City FC 2022-23</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="card">
                                        <div class="card-body">
                                            <div class="d-flex align-items-center">
                                                <div class="bg-warning bg-opacity-10 p-3 rounded me-3">
                                                    <i class="fas fa-star text-warning"></i>
                                                </div>
                                                <div>
                                                    <h5 class="mb-0">Player of the Month</h5>
                                                    <p class="text-muted mb-0">March 2023</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="card">
                                        <div class="card-body">
                                            <div class="d-flex align-items-center">
                                                <div class="bg-info bg-opacity-10 p-3 rounded me-3">
                                                    <i class="fas fa-award text-info"></i>
                                                </div>
                                                <div>
                                                    <h5 class="mb-0">Young Player Award</h5>
                                                    <p class="text-muted mb-0">2021-22 Season</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Profile Modal -->
<div class="modal fade" id="editProfileModal" tabindex="-1" aria-labelledby="editProfileModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <form id="editProfileForm">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title" id="editProfileModalLabel">
            <i class="fas fa-user-edit me-2"></i>Edit Player Profile
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <div class="row">
            <!-- Full Name -->
            <div class="col-md-6 mb-3">
              <label for="fullName" class="form-label">Full Name</label>
              <input type="text" class="form-control" id="fullName" placeholder="John Michael Smith">
            </div>
            <!-- Date of Birth -->
            <div class="col-md-6 mb-3">
              <label for="dob" class="form-label">Date of Birth</label>
              <input type="date" class="form-control" id="dob">
            </div>

            <!-- Place of Birth -->
            <div class="col-md-6 mb-3">
              <label for="birthPlace" class="form-label">Place of Birth</label>
              <input type="text" class="form-control" id="birthPlace" placeholder="London, England">
            </div>
            <!-- Nationality -->
            <div class="col-md-6 mb-3">
              <label for="nationality" class="form-label">Nationality</label>
              <input type="text" class="form-control" id="nationality" placeholder="English">
            </div>

            <!-- Height -->
            <div class="col-md-6 mb-3">
              <label for="height" class="form-label">Height (in meters)</label>
              <input type="text" class="form-control" id="height" placeholder="1.85">
            </div>
            <!-- Weight -->
            <div class="col-md-6 mb-3">
              <label for="weight" class="form-label">Weight (in kg)</label>
              <input type="text" class="form-control" id="weight" placeholder="78">
            </div>

            <!-- Jersey Number -->
            <div class="col-md-6 mb-3">
              <label for="jerseyNumber" class="form-label">Jersey Number</label>
              <input type="number" class="form-control" id="jerseyNumber" placeholder="9">
            </div>
            <!-- Preferred Foot -->
            <div class="col-md-6 mb-3">
              <label for="preferredFoot" class="form-label">Preferred Foot</label>
              <select class="form-select" id="preferredFoot">
                <option selected>Right</option>
                <option>Left</option>
                <option>Both</option>
              </select>
            </div>

            <!-- Market Value -->
            <div class="col-md-6 mb-3">
              <label for="marketValue" class="form-label">Market Value (€)</label>
              <input type="text" class="form-control" id="marketValue" placeholder="35 million">
            </div>

            <!-- Status -->
            <div class="col-md-6 mb-3">
              <label for="status" class="form-label">Player Status</label>
              <select class="form-select" id="status">
                <option selected>Active</option>
                <option>Injured</option>
                <option>Suspended</option>
                <option>Retired</option>
              </select>
            </div>
          </div>
        </div>

        <div class="modal-footer justify-content-between">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            <i class="fas fa-times me-1"></i>Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-save me-1"></i>Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
</div>


    <!-- Bootstrap 5 JS Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>