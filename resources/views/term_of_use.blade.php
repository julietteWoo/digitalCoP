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
                    Term of Use
                </h3>
                <p> We request that every new and renewing member read, agree to and abide by our forum rules and terms of service before using the site. Your use of this site signifies your agreement with all of our rules and terms of service. </p>

                <h4> Choose an appropriate username. </h4>
                <p>When you join, choose a username that is appropriate and non-offensive. Your username can be seen by other members. Most members use a nickname, but you can use your real name if you choose. You can change your username at any time.</p>

                <h4> Do not share your login details.</h4>
                <p> Do not give your user name and password to anyone. Do not use another member's account to post messages or browse the forum. And please post only under your own username. </p>

                <h4> Please respect our copyrighted materials and intellectual property. </h4>
                <p> All content and graphics on this site are protected by Australia copyright and international treaties and may not be copied or re-used without express written permission of this site. Some material on this site is available to download for personal use. However, do not reprint, republish, share, distribute or transmit content, images or downloads from this site. Do not post any copyrighted material. You agree not to post or upload material on the forums unless it is yours, you have consent from the copyright owner or you know the material is public domain. Do not copy and paste tables, charts, articles, code or materials from other websites. Please do not copy and paste materials from other websites into the forums, especially entire webpages, tables or charts which may contain HMTL or other code from another website. This is to respect copyrights as well as prevent formatting errors in our forums.

                <h4> No advertising, selling or soliciting is allowed. </h4>
                <p> No advertising, solicitations, trading of goods or services, or other commercial activities are allowed in the forums. No bulk messages, spam, chain letters, pyramid schemes, or repeat postings of the same message are permitted. Do not link out to commercial sites or sales pages. </p>

                <h4> Treat other participations with courtesy and respect. </h4>
                <p> Online discussion forums are like any other organized gathering of people; there are rules of etiquette everyone is expected to follow. We believe in free expression of a variety of viewpoints and critical discussion of all ideas. Your experience is bound only by a set of common sense rules that ask you to be civil and show respect for others when you are online. Do not express disagreements or personal vendettas on the forums. Do not name people you may have a disagreement with or allow identification of those people by inference. Do not threaten, or harass anyone, directly or by indirectly. Doing so will lead to a warning or being banned from the site. If you have any problems regarding another member or a member of the staff, you are encouraged to privately contact the website owner. Do not post offensive comments or material. You agree not to post anything which is false, vulgar, obscene, sexually-oriented, invading someone's privacy, or otherwise in violation of ANY law. Do not use ethnic slurs or hate speech. Do not libel or defame others. Do not use any profanity. </p>

                <h4> Please report offensive material. </h4>
                <p> You agree that if you see any texts, photos, videos or other posts that offend you or you think may offend other members, that you will contact the site administrator as soon as possible. Inappropriate content will be removed. We reserve the right to edit or remove objectionable or inappropriate posts. We do not monitor all forum messages in real time or hold them for approval, so objectionable content cannot be removed until it is seen by the administrators. Violators who post objectionable content may receive a warning, or have their memberships terminated. </p>

                <h4> Do not accept anything posted by other members as factual or endorsed by the website. </h4>
                <p> DCoP system does not warrant the accuracy, completeness, or usefulness of any information posted by members. Messages posted in the forum do not necessarily reflect the views of the management. Messages posted on this site by members express the views of the author only. </p>

                <h4> You are responsible for all messages and content you post on the site. </h4>
                <p> You agree to accept responsibility for all forum posts, messages and content you post or which is posted under your user name. This website does not assume responsibility for content posted by members. The person posting a message is solely responsible for that message. </p>


                <h4> Please know our privacy policies </h4>
                <p> All content posted in the forums will be content analysed for the research purpose. Posts you make in the forums can be seen by other members, but not by non-members or the public. Search engines may be able to spider and index a forum title and a small amount of text. If you post in the forums, please do so with your need for privacy in mind. You can remain anonymous if you choose and never reveal your full name and identity. You can choose to read only and never make forum posts at all. Please read our complete privacy policy if you have additional questions about privacy: here </p>

                <h4> Please know our terms of service </h4>
                <p> By using this website, including the member's only forums, you acknowledge that you understand and agree to all the rules on this page, as well as our privacy policies and legal terms of service. The complete terms of service agreement (all the "legal stuff"), can be seen here </p>

                <h3> Limitation of Liability </h3>

                <p> THIS SITE PROVIDES THE INFORMATION, SERVICES AND PRODUCTS ON THIS WEBSITE "AS IS" WITHOUT WARRANTIES OF ANY KIND. YOU ALSO AGREE THAT THIS SITE SHALL NOT BE RESPONSIBLE FOR ANY CONTENT FOUND ON THE THIS SITE FORUMS AND THAT YOUR USE OF THIS SITE FORUMS AND ANY DOWNLOADING OF MATERIALS FOUND ON OR THROUGHOUT THE THIS SITE FORUMS IS DONE AT YOUR OWN RISK AND THAT YOU WILL BE SOLELY RESPONSIBLE FOR ANY DAMAGES TO YOUR COMPUTER OR DATA THAT RESULTS. </p>

                <p> ALL EXPRESS WARRANTIES AND ALL IMPLIED WARRANTIES, INCLUDING WITHOUT LIMITATION WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT OF PROPRIETARY RIGHTS ARE HEREBY DISCLAIMED TO THE FULL EXTENT PERMITTED BY LAW. THIS SITE DOES NOT WARRANT THAT THE USE OF PERFORMANCE OF THIS WEBSITE WILL BE TIMELY, UNINTERRUPTED OR FREE OF ERROR, OR THAT THIS WEBSITE OR ITS SERVER WILL BE FREE OF VIRUSES.</p>

                <p> IN NO EVENT SHALL THIS SITE, ITS OFFICERS, DIRECTORS, AGENTS AND EMPLOYEES BE LIABLE FOR ANY LOSS OR INJURY, DIRECT OR INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL OR EXEMPLARY DAMAGES, OR ANY DAMAGES WHATSOEVER ARISING FROM THE USE OR PERFORMANCE OF THIS WEBSITE OR FROM ANY INFORMATION, SERVICES OR PRODUCTS PROVIDED THROUGH THIS WEBSITE, EVEN IF THIS SITE HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. IN THE EVENT THAT APPLICABLE LAW PREVENTS THE EXCLUSION OF LIABILITY FOR CERTAIN WARRANTIES, SUCH EXCLUSION DOES NOT APPLY TO YOU TO THE EXTENT LIMITED BY LAW.</p>
            </div>
        </div>
  
    </body>
    @include('layouts.footer_simple')
</html>