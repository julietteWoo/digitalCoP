<!DOCTYPE html>
<html>
    @include('layouts.home_header')
    <body>
        <div class="flex-center position-ref full-height">
            @if (Route::has('login'))
                <div class="top-right links">
                    @auth
                        @if(Auth::user()->type != 'community')
                            <a href="{{ url('/dashboard') }}">Dashboard</a>
                        @endif
                    @else
                        <a href="{{ route('login') }}">Login</a>

                        @if (Route::has('register'))
                            <a href="{{ route('register') }}">Register</a>
                        @endif
                    @endauth
                </div>
            @endif

            <div class="content">
                <div class="title m-b-md">
                    Digital Community of Practice
                </div>

                <div class="m-b-md" style="margin-left:70px; margin-right:70px">
                    <h3>
                        This research is to develop a Digital Community of Practice system for teachers to share their knowledge and evaluate if such a community knowledge sharing and collaboration practice (Community of Practice) can enhance teachers’ collaboration between Arts and STEM subjects. 
                    </h3>
                    <p>
                        It aims to support teachers’ communication and co-planning towards STEAM practice. STEAM education has been widely discussed internationally in the purpose of various reasons such as increasing students’ learning motivation, encourage life-long learning and cultivate creativity for 21st-century's citizen and workforce. It requires teachers’ transdisciplinary teaching practices by collaboration, which is a great challenge for teachers. The difficulty in collaboration between Arts and STEM subjects are widely perceived. A Community of Practice is a knowledge management and sharing practice which based on knowledge theory. It has been commonly used in the industry to enhance an organization’s knowledge creation and innovative ability by improving organizational collaboration across departments as well as a broader knowledge community. This research aims to explore a way to support teachers’ collaboration between subjects, especially between Arts and STEM, to promote schoolteachers’ co-planning towards STEAM practice. The result of the research will help establish a fundamental structure of a Digital Community of Practice System within the secondary school environment for future expanding to broader community collaboration. 
                    </p> 
                    <a href="/public" class="btn btn-warning" >Public Access</a>
                </div>
            </div>
        </div>
    </body>
    @include('layouts.footer_simple')
</html>