<head>
    <title>DCoP v{{ Config::get('app.version') }}</title>
    <meta charset="utf-8">

    <!-- Mobile specific metas -->
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1 user-scalable=no">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Force IE9 to render in normal mode -->
    <!--[if IE]><meta http-equiv="x-ua-compatible" content="IE=9" /><![endif]-->
    <meta name="author" content="Zihua Wu" />
    <meta name="description" content="Digital CoP" />
    <meta name="keywords" content="Digital CoP" />
    <meta name="application-name" content="Digital CoP" />

    <!-- Import google fonts - Heading first/ text second -->
    <link href='http://fonts.googleapis.com/css?family=Quattrocento+Sans:400,700' rel='stylesheet' type='text/css'>
   
        <!-- Icons -->
        <link rel="stylesheet" href="{{ URL::asset('assets/css/icons.css') }}">
        
        <!-- Bootstrap stylesheets (included template modifications) -->
        <link rel="stylesheet" href="{{ URL::asset('assets/css/bootstrap.css') }}">
        
        <!-- Plugins stylesheets (all plugin custom css) -->
        <link rel="stylesheet" href="{{ URL::asset('assets/css/plugins.css') }}">
        
        <!-- Main stylesheets (template main css file) -->
        <link rel="stylesheet" href="{{ URL::asset('assets/css/main.css') }}">
        
        <!-- Custom stylesheets ( Put your own changes here ) -->
        <link rel="stylesheet" href="{{ URL::asset('assets/css/custom.css') }}">

        <link rel="stylesheet" href="{{ URL::asset('assets/css//textAngular-1.5.16/dist/textAngular.css') }}" media="screen">
 
    <!-- Fav and touch icons -->
    <link rel="icon" href="{{ URL::asset('img/ico/favicon.ico')}}" type="image/png">
    
    <!-- Windows8 touch icon ( http://www.buildmypinnedsite.com/ )-->
    <meta name="msapplication-TileColor" content="#3399cc" />




  
    
</head>

