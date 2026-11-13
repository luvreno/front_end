import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { company, consentConfig, isPlaceholder, legal } from '../content';
import { staticRoutes } from '../lib/seoData.ts';
import { Seo } from '../components/Seo';
import { LogoMark } from '../components/Logo';
import { useConsent } from '../components/ConsentContext';
import '../styles/blog.css';

type Kind = 'privacy' | 'terms' | 'cookies';
const titles: Record<Kind, string> = { privacy: 'Privacy Policy', terms: 'Terms and Conditions', cookies: 'Cookie Policy' };
const BUILD_DATE = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : new Date().toISOString().slice(0, 10);
const prettyDate = new Date(BUILD_DATE + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function S({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}

/** Contact block fed by the single company object. */
function CompanyContact() {
  return (
    <S id="contact-us" title="Contact Us">
      <p>If you have any questions about this document or your personal information, you can contact us:</p>
      <dl className="legal-contact" data-testid="legal-contact">
        <div><dt>Company (Sri Lanka)</dt><dd>{company.legalName} (trading as {company.tradingName})</dd></div>
        <div><dt>Company (USA)</dt><dd>{company.legalNameUsa}</dd></div>
        <div><dt>Founder</dt><dd>{company.founder} (Founded: {company.foundedDate})</dd></div>
        <div><dt>Email</dt><dd>{isPlaceholder(company.email) ? company.email : <a href={`mailto:${company.email}`}>{company.email}</a>}</dd></div>
        <div><dt>Phone (Sri Lanka)</dt><dd>{isPlaceholder(company.phone) ? company.phone : <a href={`tel:${company.phone.replace(/[^+\d]/g, '')}`}>{company.phone}</a>}</dd></div>
        <div><dt>Phone (USA)</dt><dd>{isPlaceholder(company.phoneUsa) ? company.phoneUsa : <a href={`tel:${company.phoneUsa.replace(/[^+\d]/g, '')}`}>{company.phoneUsa}</a>}</dd></div>
        <div><dt>Address (Sri Lanka)</dt><dd>{company.address}</dd></div>
        <div><dt>Address (USA)</dt><dd>{company.addressUsa}</dd></div>
        <div><dt>Website</dt><dd><a href={company.website} target="_blank" rel="noopener noreferrer">{company.website.replace(/^https?:\/\//, '')}</a></dd></div>
      </dl>
      <p>You can also use our <Link to="/#contact">contact form</Link>.</p>
    </S>
  );
}

function Privacy() {
  return (
    <>
      <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
      <p>We use Your Personal Data to provide and improve the Service. We collect, use, and disclose Your information as described in this Privacy Policy and, where required by applicable law, only where We have a valid legal basis to do so, including Your consent (where consent is required).</p>

      <S id="privacy-definitions" title="Interpretation and Definitions">
        <h3>Interpretation</h3>
        <p>The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
        <h3>Definitions</h3>
        <p>For the purposes of this Privacy Policy:</p>
        <ul>
          <li><strong>Account</strong> means a unique account created for You to access Our Service or parts of Our Service.</li>
          <li><strong>Affiliate</strong> means an entity that controls, is controlled by, or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</li>
          <li><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Privacy Policy) refers to Luvreno (Luvreno PVT LTD in Sri Lanka and Luvreno LLC in the United States, founded by Akash Perera on November 10, 2023).</li>
          <li><strong>Cookies</strong> are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website, among its many uses.</li>
          <li><strong>Country/State</strong> refers to: Sri Lanka.</li>
          <li><strong>Device</strong> means any device that can access the Service, such as a computer, a cell phone or a digital tablet.</li>
          <li><strong>Personal Data</strong> (or "Personal Information") is any information that relates to an identified or identifiable individual. We use "Personal Data" and "Personal Information" interchangeably unless a law uses a specific term.</li>
          <li><strong>Service</strong> refers to the Website.</li>
          <li><strong>Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</li>
          <li><strong>Usage Data</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</li>
          <li><strong>User</strong> means any individual who accesses or uses the Service.</li>
          <li><strong>Website</strong> refers to Luvreno, accessible from <a href="https://luvreno.net/" target="_blank" rel="noopener noreferrer">https://luvreno.net/</a>.</li>
          <li><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
        </ul>
      </S>

      <S id="collecting-personal-data" title="Collecting and Using Your Personal Information">
        <h3>Types of Data Collected</h3>
        <h4>Personal Data</h4>
        <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:</p>
        <ul>
          <li>Email address</li>
          <li>First name and last name</li>
          <li>Phone number</li>
          <li>Address, State, Province, ZIP/Postal code, City</li>
        </ul>

        <h4>Usage Data</h4>
        <p>Usage Data is collected automatically when using the Service.</p>
        <p>Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of Our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
        <p>When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device's unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.</p>
        <p>We may also collect information that Your browser sends whenever You visit Our Service or when You access the Service by or through a mobile device.</p>

        <h4>Tracking Technologies and Cookies</h4>
        <p>We use tracking technologies (such as cookies) to track the activity and to improve Our Service. The technologies We use may include:</p>
        <ul>
          <li><strong>Cookies or Browser Cookies.</strong> A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of Our Service.</li>
          <li><strong>Web Beacons.</strong> Certain sections of Our Service may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who have visited those pages and for other related website statistics.</li>
        </ul>
        <p>Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on Your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close Your web browser.</p>
        <p>Where required by law, We use non-essential cookies (that is, Cookies other than the Necessary / Essential Cookies described below) only with Your consent. You can withdraw or change Your consent at any time using Our cookie preferences tool or through Your browser/device settings. Withdrawing consent does not affect the lawfulness of processing based on consent before its withdrawal.</p>
        <p>We use both Session and Persistent Cookies for the purposes set out below:</p>
        <ul>
          <li>
            <p><strong>Necessary / Essential Cookies</strong> (Session Cookies, Administered by Us)</p>
            <p>Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.</p>
          </li>
          <li>
            <p><strong>Cookies Policy / Notice Acceptance Cookies</strong> (Persistent Cookies, Administered by Us)</p>
            <p>Purpose: These Cookies identify whether users have accepted the use of cookies on the Website and record the consent choices You have made, so that We can honor those choices on future visits.</p>
          </li>
          <li>
            <p><strong>Functionality Cookies</strong> (Persistent Cookies, Administered by Us)</p>
            <p>Purpose: These Cookies allow Us to remember choices You make when You use the Website, such as remembering Your Account login details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to avoid You having to re-enter Your preferences every time You use the Website.</p>
          </li>
        </ul>
      </S>

      <S id="use-of-personal-data" title="Use of Your Personal Data">
        <p>The Company may use Personal Data for the following purposes:</p>
        <ul>
          <li><strong>To provide and maintain Our Service</strong>, including to monitor the usage of Our Service.</li>
          <li><strong>To manage Your Account:</strong> to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service that are available to You as a registered user.</li>
          <li><strong>For the performance of a contract:</strong> the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.</li>
          <li><strong>To contact You:</strong> To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application's push notifications regarding updates or informative communications related to the functionalities, products or contracted services, including security updates, when necessary or reasonable for their implementation.</li>
          <li><strong>To provide You</strong> with news, special offers, and general information about other goods, services and events which We offer that are similar to those that You have already purchased or inquired about.</li>
          <li><strong>To manage Your requests:</strong> To attend and manage Your requests to Us.</li>
          <li><strong>For business transfers:</strong> We may use Your Personal Data to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets.</li>
          <li><strong>For other purposes:</strong> We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of Our promotional campaigns, and evaluating and improving Our Service, products, services, marketing and Your experience.</li>
        </ul>
        <p>We may share Your Personal Data in the following situations:</p>
        <ul>
          <li><strong>With Service Providers:</strong> We may share Your Personal Data with Service Providers to monitor and analyze the use of Our Service, and to contact You.</li>
          <li><strong>For business transfers:</strong> We may share or transfer Your Personal Data in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to another company.</li>
          <li><strong>With Affiliates:</strong> We may share Your Personal Data with Our affiliates, in which case We will require those affiliates to honor this Privacy Policy.</li>
          <li><strong>With other users:</strong> If Our Service offers public areas, when You share Personal Data or otherwise interact in the public areas with other users, such information may be viewed by all users and may be publicly distributed outside the Service.</li>
          <li><strong>With Your consent:</strong> We may disclose Your Personal Data for any other purpose with Your consent.</li>
        </ul>
      </S>

      <S id="sms-privacy-notice" title="Text Messages Privacy Notice">
        <p>You have the option to receive text (SMS) messages from Us. If You opt in to text messages, We will send You updates, notifications, and other communications as described below. When You opt in, We will collect and store the information You provide in connection with text messaging, such as Your phone number, the date and method of Your consent, and message delivery and read information.</p>
        <p>No mobile information will be shared with or sold to third parties or affiliates for marketing or promotional purposes. The phone numbers and consent records We collect for texting are never shared with anyone for any purpose, except the Service Providers that technically have to handle them to deliver the texts.</p>
        <p>Consent to receive text messages is not a condition of any purchase or use of Our Service. If You consent to receive SMS from Us, You agree to receive text messages from Us related to:</p>
        <ul>
          <li>Customer care and support</li>
          <li>Account notifications, such as activity, status, or renewal reminders</li>
          <li>Delivery notifications and updates on the status of a delivery</li>
          <li>Authentication messages, such as one-time passwords (OTP) and passcodes</li>
          <li>Security alerts, such as suspicious login attempts or unusual account activity</li>
          <li>Marketing and promotional offers, discounts, and other promotional content</li>
        </ul>
        <p>Reply STOP to opt-out. Reply HELP for support. Message and data rates may apply. Messaging frequency may vary. Carriers are not liable for delayed or undelivered messages.</p>
      </S>

      <S id="retention-personal-data" title="Retention of Your Personal Data">
        <p>The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with Our legal obligations, resolve disputes, and enforce Our legal agreements and policies.</p>
        <p>Where possible, We apply shorter retention periods and/or reduce identifiability by deleting, aggregating, or anonymizing data. Unless otherwise stated, the retention periods below are maximum periods ("up to") and We may delete or anonymize data sooner when it is no longer needed for the relevant purpose. We apply different retention periods to different categories of Personal Data based on the purpose of processing and legal obligations:</p>
        <ul>
          <li><strong>Account Information:</strong> User Accounts are retained for the duration of Your Account relationship plus up to 24 months after account closure to handle any post-termination issues or resolve disputes.</li>
          <li><strong>Customer Support Data:</strong> Support tickets and correspondence up to 24 months from the date of ticket closure; chat transcripts up to 24 months for quality assurance and staff training purposes.</li>
          <li><strong>Usage Data:</strong> Website analytics data (cookies, IP addresses, device identifiers) and server logs up to 24 months from the date of collection.</li>
        </ul>
        <p>When retention periods expire, We securely delete or anonymize Personal Data according to verified deletion, backup rotation, and anonymization procedures.</p>
      </S>

      <S id="transfer-personal-data" title="Transfer of Your Personal Data">
        <p>Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. This means that this information may be transferred to, and maintained on, computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ from those of Your jurisdiction.</p>
        <p>Where required by applicable law, We will ensure that international transfers of Your Personal Data are subject to appropriate safeguards and, where relevant, supplementary measures. The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place, including the security of Your data and other personal information.</p>
      </S>

      <S id="delete-data" title="Delete Your Personal Data">
        <p>You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You.</p>
        <p>Our Service may give You the ability to delete certain information about You from within the Service.</p>
        <p>You may update, amend, or delete Your information at any time by signing in to Your Account, if You have one, and visiting the account settings section that allows You to manage Your personal information. You may also contact Us to request access to, correct, or delete any Personal Data that You have provided to Us.</p>
        <p>Please note, however, that We may need to retain certain information when We have a legal obligation or lawful basis to do so.</p>
      </S>

      <S id="disclosure-security" title="Disclosure and Security of Your Personal Data">
        <h3>Business Transactions</h3>
        <p>If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>
        <h3>Law Enforcement</h3>
        <p>Under certain circumstances, the Company may disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).</p>
        <h3>Other Legal Requirements</h3>
        <p>The Company may disclose Your Personal Data in the good-faith belief that such action is necessary to comply with a legal obligation, protect and defend the rights or property of the Company, prevent or investigate possible wrongdoing in connection with the Service, protect the personal safety of Users of the Service or the public, or protect against legal liability.</p>
        <h3>Security of Your Personal Data</h3>
        <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While We strive to use commercially reasonable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>
      </S>

      <S id="service-providers" title="Detailed Information on the Processing of Your Personal Data">
        <p>The Service Providers We use may have access to Your Personal Data. These third-party vendors collect, store, use, process and transfer information about Your activity on Our Service in accordance with their Privacy Policies.</p>
        <h3>Usage, Performance and Miscellaneous</h3>
        <ul>
          <li>
            <p><strong>Mouseflow</strong></p>
            <p>Mouseflow is a session replay and heatmap tool that shows how visitors click, move, scroll, browse, and pay attention on websites. The service is operated by Mouseflow ApS.</p>
            <p>The information gathered by Mouseflow is held in accordance with its Privacy Policy: <a href="https://mouseflow.com/privacy/" target="_blank" rel="noopener noreferrer">https://mouseflow.com/privacy/</a></p>
          </li>
          <li>
            <p><strong>FreshDesk</strong></p>
            <p>FreshDesk is customer support software. The service is operated by Freshworks, Inc.</p>
            <p>The information gathered by FreshDesk is held in accordance with its Privacy Policy: <a href="https://www.freshworks.com/privacy/" target="_blank" rel="noopener noreferrer">https://www.freshworks.com/privacy/</a></p>
          </li>
          <li>
            <p><strong>Google Places and Google reCAPTCHA</strong></p>
            <p>Google Places and reCAPTCHA are operated by Google LLC for address resolution and abuse prevention.</p>
            <p>The information gathered is held in accordance with the Privacy Policy of Google: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a></p>
          </li>
          <li>
            <p><strong>Formspree</strong></p>
            <p>Formspree facilitates form processing and delivery for our contact and newsletter forms.</p>
            <p>The information gathered is held in accordance with Formspree's Privacy Policy: <a href="https://formspree.io/legal/privacy-policy" target="_blank" rel="noopener noreferrer">https://formspree.io/legal/privacy-policy</a></p>
          </li>
          <li>
            <p><strong>Chatwoot</strong></p>
            <p>Chatwoot provides live customer communication and assistance services.</p>
            <p>The information gathered is held in accordance with Chatwoot's Privacy Policy: <a href="https://www.chatwoot.com/privacy-policy" target="_blank" rel="noopener noreferrer">https://www.chatwoot.com/privacy-policy</a></p>
          </li>
        </ul>
      </S>

      <S id="childrens-privacy" title="Children's and Minors' Privacy">
        <p>The Service is not directed to, and We do not knowingly collect Personal Information from, anyone under the age of 16.</p>
        <p>If You are a parent or guardian and You believe Your child has provided Us with Personal Information, please contact Us. If We become aware that We have collected Personal Information from anyone under the age of 16, We will take steps to remove that information from Our servers as soon as reasonably possible.</p>
        <p>Some countries and states set a higher age at which an individual can consent to the processing of their own Personal Information. Where We rely on consent as a legal basis and the law applicable to a User sets an age higher than 16, We may require the consent of that User's parent or guardian before We collect and use their Personal Information.</p>
      </S>

      <S id="links-other-sites" title="Links to Other Websites">
        <p>Our Service may contain links to other websites that are not operated by Us. If You click on a third-party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.</p>
        <p>We have no control over and assume no responsibility for the content, privacy policies or practices of any third-party sites or services.</p>
      </S>

      <S id="changes-privacy-policy" title="Changes to this Privacy Policy">
        <p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.</p>
        <p>We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the date at the top of this Privacy Policy.</p>
        <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
      </S>

      <CompanyContact />
    </>
  );
}

function Terms() {
  return (
    <>
      <p>Please read these terms and conditions carefully before using Our Service.</p>

      <S id="terms-definitions" title="Interpretation and Definitions">
        <h3>Interpretation</h3>
        <p>The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
        <h3>Definitions</h3>
        <p>For the purposes of these Terms and Conditions:</p>
        <ul>
          <li><strong>Affiliate</strong> means an entity that controls, is controlled by, or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</li>
          <li><strong>Country/State</strong> refers to: Sri Lanka.</li>
          <li><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in these Terms and Conditions) refers to Luvreno (Luvreno PVT LTD in Sri Lanka and Luvreno LLC in the United States).</li>
          <li><strong>Device</strong> means any device that can access the Service such as a computer, a cell phone or a digital tablet.</li>
          <li><strong>Service</strong> refers to the Website.</li>
          <li><strong>Terms and Conditions</strong> (also referred to as "Terms") means these Terms and Conditions, including any documents expressly incorporated by reference, which govern Your access to and use of the Service and form the entire agreement between You and the Company regarding the Service.</li>
          <li><strong>Third-Party Social Media Service</strong> means any services or content (including data, information, products or services) provided by a third party that is displayed, included, made available, or linked to through the Service.</li>
          <li><strong>Website</strong> refers to Luvreno, accessible from <a href="https://luvreno.net/" target="_blank" rel="noopener noreferrer">https://luvreno.net/</a>.</li>
          <li><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
        </ul>
      </S>

      <S id="acknowledgment" title="Acknowledgment">
        <p>These are the Terms and Conditions governing the use of this Service and the agreement between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
        <p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>
        <p>By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.</p>
        <p>You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.</p>
        <p>Your access to and use of the Service is also subject to Our Privacy Policy, which describes how We collect, use, and disclose personal information. Please read Our Privacy Policy carefully before using Our Service.</p>
      </S>

      <S id="links-other-websites" title="Links to Other Websites">
        <p>Our Service may contain links to third-party websites or services that are not owned or controlled by the Company.</p>
        <p>The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such websites or services.</p>
        <p>We strongly advise You to read the terms and conditions and privacy policies of any third-party websites or services that You visit.</p>
        <h3>Links from a Third-Party Social Media Service</h3>
        <p>The Service may display, include, make available, or link to content or services provided by a Third-Party Social Media Service. A Third-Party Social Media Service is not owned or controlled by the Company, and the Company does not endorse or assume responsibility for any Third-Party Social Media Service.</p>
        <p>You acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with Your access to or use of any Third-Party Social Media Service, including any content, goods, or services made available through them. Your use of any Third-Party Social Media Service is governed by that Third-Party Social Media Service's terms and privacy policies.</p>
      </S>

      <S id="termination" title="Termination">
        <p>We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.</p>
        <p>Upon termination, Your right to use the Service will cease immediately.</p>
      </S>

      <S id="limitation-liability" title="Limitation of Liability">
        <p>Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of these Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or one hundred US dollars if You have not purchased anything through the Service.</p>
        <p>To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data or other information, for business interruption, for personal injury, loss of privacy arising out of or in any way related to the use of or inability to use the Service, third-party software and/or third-party hardware used with the Service, or otherwise in connection with any provision of these Terms), even if the Company or any supplier has been advised of the possibility of such damages and even if the remedy fails of its essential purpose.</p>
        <p>Some states do not allow the exclusion of implied warranties or limitation of liability for incidental or consequential damages, which means that some of the above limitations may not apply. In these states, each party's liability will be limited to the greatest extent permitted by law.</p>
      </S>

      <S id="as-is-disclaimer" title={'"AS IS" and "AS AVAILABLE" Disclaimer'}>
        <p>The Service is provided to You "AS IS" and "AS AVAILABLE" and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service, including all implied warranties of merchantability, fitness for a particular purpose, title and non-infringement, and warranties that may arise out of course of dealing, course of performance, usage or trade practice. Without limitation to the foregoing, the Company provides no warranty or undertaking, and makes no representation of any kind that the Service will meet Your requirements, achieve any intended results, be compatible or work with any other software, applications, systems or services, operate without interruption, meet any performance or reliability standards or be error free or that any errors or defects can or will be corrected.</p>
        <p>Without limiting the foregoing, neither the Company nor any of the company's provider makes any representation or warranty of any kind, express or implied: (i) as to the operation or availability of the Service, or the information, content, and materials or products included thereon; (ii) that the Service will be uninterrupted or error-free; (iii) as to the accuracy, reliability, or currency of any information or content provided through the Service; or (iv) that the Service, its servers, the content, or emails sent from or on behalf of the Company are free of viruses, scripts, trojan horses, worms, malware, timebombs or other harmful components.</p>
        <p>Some jurisdictions do not allow the exclusion of certain types of warranties or limitations on applicable statutory rights of a consumer, so some or all of the above exclusions and limitations may not apply to You. But in such a case the exclusions and limitations set forth in this section shall be applied to the greatest extent enforceable under applicable law.</p>
      </S>

      <S id="governing-law" title="Governing Law">
        <p>The laws of Sri Lanka, excluding its conflicts of law rules, shall govern these Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.</p>
      </S>

      <S id="disputes-resolution" title="Disputes Resolution">
        <p>If You have any concern or dispute about the Service, You agree to first try to resolve the dispute informally by contacting the Company.</p>
      </S>

      <S id="eu-users" title="For European Union (EU) Users">
        <p>If You are a European Union consumer, you will benefit from any mandatory provisions of the law of the country in which You are resident.</p>
      </S>

      <S id="us-legal-compliance" title="United States Legal Compliance">
        <p>You represent and warrant that (i) You are not located in a country that is subject to the United States government embargo, or that has been designated by the United States government as a "terrorist supporting" country, and (ii) You are not listed on any United States government list of prohibited or restricted parties.</p>
      </S>

      <S id="severability-waiver" title="Severability and Waiver">
        <h3>Severability</h3>
        <p>If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.</p>
        <h3>Waiver</h3>
        <p>Except as provided herein, the failure to exercise a right or to require performance of an obligation under these Terms shall not affect a party's ability to exercise such right or require such performance at any time thereafter nor shall the waiver of a breach constitute a waiver of any subsequent breach.</p>
      </S>

      <S id="translation-interpretation" title="Translation Interpretation">
        <p>These Terms and Conditions may have been translated if We have made them available to You on our Service. You agree that the original English text shall prevail in the case of a dispute.</p>
      </S>

      <S id="changes-terms" title="Changes to These Terms and Conditions">
        <p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.</p>
        <p>By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, in whole or in part, please stop using the Service.</p>
      </S>

      <CompanyContact />
    </>
  );
}

function Cookies() {
  const { openDialog } = useConsent();
  return (
    <>
      <S id="what" title="1. What this covers">
        <p>The site uses browser storage (cookies, local storage and session storage) for a small number of purposes. Optional categories stay off until you allow them.</p>
      </S>
      <S id="categories" title="2. Categories">
        <div className="legal-table-wrap">
          <table className="legal-table">
            <caption className="sr-only">Storage categories</caption>
            <thead><tr><th scope="col">Category</th><th scope="col">Purpose</th><th scope="col">Default</th></tr></thead>
            <tbody>
              {consentConfig.categories.map((c) => (
                <tr key={c.id}><th scope="row">{c.label}</th><td>{c.text}</td><td>{c.locked ? 'Always on' : 'Off until you allow it'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </S>
      <S id="items" title="3. Items we store">
        <ul>
          <li><code>lv-consent</code> (local storage, necessary): your choice, its date and the policy version.</li>
          <li><code>lv-intro-v1</code> (session storage, necessary): remembers that the short intro played this session.</li>
          <li><code>lv-strip-dismissed-v1</code> (local storage with Preferences, otherwise session storage): remembers that you closed the announcement strip.</li>
          <li>Google reCAPTCHA (necessary for form security): set by Google when a form with reCAPTCHA loads.</li>
        </ul>
      </S>
      <S id="change" title="4. Changing your choice">
        <p>You can change your choice at any time.</p>
        <button type="button" className="btn btn-primary" onClick={openDialog}>Open cookie preferences</button>
        <p className="legal-small">When we change this policy we update its version, and you will be asked again.</p>
      </S>
      <CompanyContact />
    </>
  );
}

export default function Legal({ kind }: { kind: Kind }) {
  const title = titles[kind];
  return (
    <>
      <Seo {...staticRoutes[`/${kind}`]} />
      <article className="section section-cream page-top legal" aria-labelledby="legal-title">
        <div className="container legal-inner">
          <LogoMark size={48} className="legal-mark" />
          <h1 id="legal-title" className="legal-title">{title}</h1>
          <p className="mono legal-updated">Last updated: <time dateTime={BUILD_DATE}>{prettyDate}</time></p>
          {legal.draftBanner ? <p className="legal-banner" role="note" data-testid="legal-draft">{legal.draftBanner}</p> : null}
          <div className="prose legal-body">
            {kind === 'privacy' ? <Privacy /> : kind === 'terms' ? <Terms /> : <Cookies />}
          </div>
        </div>
      </article>
    </>
  );
}
