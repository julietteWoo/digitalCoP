<!DOCTYPE html>
<html>
    @include('layouts.home_header')
    <body>
        <div class="navbar navbar-expand-md navbar-light bg-white shadow-sm">
            <div class="top-left links">
                <a href="{{ url('/') }}">Home</a>
            </div>
            @if (Route::has('login'))
                <div class="top-right links">
                    @auth
                        <a href="{{ url('/dashboard') }}">Dashboard</a>
                    @else
                        <a href="{{ route('login') }}">Login</a>

                        @if (Route::has('register'))
                            <a href="{{ route('register') }}">Register</a>
                        @endif
                    @endauth
                </div>
            @endif
        </div>


        <div class="content">

            <div class="m-b-md" style="margin-left:70px; margin-right:70px; margin-top:100px; margin-bottom:100px">
                <h3>
                    Privacy Policy
                </h3>
                <h4> What information do we collect? </h4>
                <p> We collect information from you when you register on our site, and invoving in discussion in the forum</p>

                <p> When registering on our site, as appropriate, you may be asked to enter your: username, e-mail address, mailing address. You may, however, visit our home site anonymously.</p>

                <h4> What do we use your information for? </h4>
                <p> There may potential unexpected contact details divulge as the personal contact information will be shared within the participant group for promoting communication and collaboration purpose.

                The content data in the system will be sent to Google Natural Language API. No personal information will be sent to Google Natural Language API. The data will not be deleted from their database for a couple of hours.</p>

                <h4> How do we protect your information? </h4>

                <p> We implement a variety of security measures to maintain the safety of your personal information. We offer the use of a secure server. All supplied sensitive information is transmitted via Secure Socket Layer (SSL) technology and then encrypted into our payment gateway providers database only to be accessible by those authorized with special access rights to such systems, and are required to keep the information confidential. </p>

                <h4> Do we disclose any information to outside parties? </h4>

                <p>We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential. We may also release your information when we believe release is appropriate to comply with the law, enforce our site policies, or protect ours or others rights, property, or safety. However, non-personally identifiable visitor information may be provided to other parties for marketing, advertising, or other uses.</p>

                <h4> Third party services </h4>

                <p> This project will use Qualtrics to collect survey data. If you agree to participate in this survey, the responses you provide will be stored on their host server. No personal information will be collected in the survey. Once we have completed our data collection and analysis, we will import the data to the RMIT server where it will be stored securely for 5 years. The data on the host server will then be deleted. </p>

                <h4> Your Consent </h4>

                <p>By using our site, you consent to our web site privacy policy.</p>

                <h4> Changes to our Privacy Policy </h4>

                <p>If we decide to change our privacy policy, we will post those changes on this page, and/or update the Privacy Policy modification date below.</p>

                <p> This policy was last modified on 30 Jan 2021.</p>

                <h4> Contacting Us </h4>

                <p>If there are any questions regarding this privacy policy you may contact us using the information below.</p>

                <p>Digital Community of Practice</p>
                <p>s3316218@student.rmit.edu.au</p>
            </div>
        </div>
    </body>
    @include('layouts.footer_simple')
</html>