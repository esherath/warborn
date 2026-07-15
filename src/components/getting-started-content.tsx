import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Download, Info } from "lucide-react";

type StartPageSlug = "getting-ready" | "installation" | "launcher" | "client-setting" | "login" | "create-character";

function GuideHeading({ children }: { children: ReactNode }) {
  return <h2 className="start-guide-heading"><Check />{children}</h2>;
}

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return <li className="start-step"><b>{number}</b><div><strong>{title}</strong><div className="start-step-copy">{children}</div></div></li>;
}

function ManualImage({ src, alt, width, height, className = "" }: { src: string; alt: string; width: number; height: number; className?: string }) {
  return <figure className={`manual-shot ${className}`}><Image src={src} alt={alt} width={width} height={height} sizes="(max-width: 700px) 92vw, 620px" /></figure>;
}

function GettingReady() {
  return <>
    <section className="start-guide-section">
      <GuideHeading>System Requirements</GuideHeading>
      <div className="start-requirements"><table><thead><tr><th /><th>Minimum Requirement</th><th>Recommended Requirement</th></tr></thead><tbody>
        <tr><th>OS</th><td colSpan={2}>Microsoft Windows® 98 / 2000 / XP / Vista / 7 / 8</td></tr>
        <tr><th>Direct X</th><td colSpan={2}>DirectX® 8.1 or higher</td></tr>
        <tr><th>CPU</th><td>Pentium® 4 1.6GHz</td><td>Pentium® 4 3.0GHz</td></tr>
        <tr><th>RAM</th><td>at least 1GB</td><td>2GB or higher</td></tr>
        <tr><th>Graphic Card</th><td>NVIDIA GeForce4 MX<br />ATI Radeon 9500</td><td>NVIDIA GeForce 7600<br />ATI Radeon X1600</td></tr>
        <tr><th>Sound Card</th><td colSpan={2}>DirectX® 8.1 Compatible</td></tr>
        <tr><th>HDD</th><td colSpan={2}>at least 4GB</td></tr>
        <tr><th>Network</th><td colSpan={2}>at least 128 kbps DSL/Cable Broadband Internet Connection</td></tr>
      </tbody></table></div>
    </section>
    <section className="start-checklist"><h3><Check /> Please check the system requirements.</h3><ul><li>If your system does not meet the minimum requirements, you may experience some problems.</li><li>We recommend that you lower the graphic options for the minimum requirement specifications.</li></ul></section>
    <section className="driver-panel"><strong>※ Download and install the latest driver</strong><div><a href="https://www.amd.com/en/support" target="_blank" rel="noreferrer"><Image src="/assets/guides/getting-started/getting-ready-amd.png" alt="AMD drivers" width={122} height={22} /></a><a href="https://www.nvidia.com/Download/index.aspx" target="_blank" rel="noreferrer"><Image src="/assets/guides/getting-started/getting-ready-nvidia.png" alt="NVIDIA drivers" width={122} height={22} /></a><a href="https://www.intel.com/content/www/us/en/download-center/home.html" target="_blank" rel="noreferrer"><Image src="/assets/guides/getting-started/getting-ready-intel.png" alt="Intel drivers" width={122} height={22} /></a></div></section>
    <section className="start-callout"><strong>※ How to check the current DirectX version and the specifications of your PC?</strong><ol><li>Select [ Start -&gt; Run ].</li><li>Type “dxdiag” and click OK button.</li><li>Check the system information.</li></ol></section>
  </>;
}

function Installation() {
  return <>
    <p className="start-guide-lead">Download the Warborn client and install it on your PC.</p>
    <ol className="start-steps">
      <Step number={1} title="Download the client"><span>Click the official Client Download button and save the installer to your computer.</span><Link className="installer-button" href="/game/downloads/client-download"><Download /> CLIENT DOWNLOAD<small>Full Client</small></Link><ManualImage className="manual-shot-small" src="/assets/guides/getting-started/install-01.png" alt="Warborn full client installer icon" width={106} height={108} /></Step>
      <Step number={2} title="Run the installer"><span>Select and launch the Warborn installer from the folder where it was downloaded.</span><ManualImage src="/assets/guides/getting-started/install-02.png" alt="Windows installation wizard welcome screen" width={499} height={388} /></Step>
      <Step number={3} title="Begin setup"><span>When the Install Wizard appears, close other programs and click “Next” to continue.</span><ManualImage src="/assets/guides/getting-started/install-03.png" alt="Windows installation wizard agreement screen" width={499} height={388} /></Step>
      <Step number={4} title="Accept the agreement"><span>Read the license agreement, select “I accept”, and click “Next”.</span><ManualImage src="/assets/guides/getting-started/install-04.png" alt="Windows installation wizard destination folder screen" width={499} height={388} /></Step>
      <Step number={5} title="Choose an installation folder"><span>Select the folder where Warborn will be installed. Make sure the drive has enough free space.</span><ManualImage src="/assets/guides/getting-started/install-05.png" alt="Warborn client installation progress" width={499} height={388} /></Step>
      <Step number={6} title="Complete installation"><span>After the progress bar is complete, click “Finish”. A Warborn shortcut will be created on your desktop.</span><ManualImage className="manual-shot-small" src="/assets/guides/getting-started/install-07.png" alt="Warborn desktop shortcut" width={106} height={120} /></Step>
    </ol>
  </>;
}

function Launcher() {
  return <>
    <p className="start-guide-lead">After the installation procedure has completed, start the game by double-clicking the Warborn shortcut.</p>
    <p className="start-path">※ Select [ Start -&gt; Programs -&gt; Warborn -&gt; Warborn ] to start the game.</p>
    <GuideHeading>Game Launcher</GuideHeading>
    <ManualImage className="manual-shot-wide" src="/assets/guides/getting-started/launcher.png" alt="Game launcher with news, update progress and numbered controls" width={1370} height={800} />
    <dl className="launcher-legend">
      <div><dt>A</dt><dd><strong>Notice</strong><p>Announces latest and update news with links to take you to the Warborn website.</p></dd></div>
      <div><dt>B</dt><dd><strong>Server List</strong><p>Displays the available servers. Select a server or double-click one to proceed to the login screen.</p><em>* To play a specific character, select the same server where you created that character.</em></dd></div>
      <div><dt>C</dt><dd><strong>Login</strong><p>Proceeds to the login screen when a server is selected. If a server is not listed, it may be under maintenance.</p></dd></div>
      <div><dt>D</dt><dd><strong>Status Bar</strong><p>Displays patching information or server connection status.</p></dd></div>
    </dl>
    <ol className="launcher-numbered">
      <Step number={1} title="New Account">Opens the free registration page. You cannot play the game without an account.</Step>
      <Step number={2} title="Change Password">Opens account information, where you can change your password and other information.</Step>
      <Step number={3} title="Settings">Opens ClientSetup to choose your language and adjust client settings.</Step>
      <Step number={4} title="File Check">Scans game files, downloads missing patches and repairs damaged files. This may take some time depending on your connection.</Step>
      <Step number={5} title="Music On/Off">Toggles the launcher background music.</Step>
      <Step number={6} title="Quit">Exits the game launcher.</Step>
    </ol>
  </>;
}

function ClientSetting() {
  return <>
    <p className="start-guide-lead">ClientSetup is an application for adjusting the client settings according to your preference. It consists of three sections.</p>
    <section className="setting-guide"><GuideHeading>System tab displays your computer details.</GuideHeading><ManualImage src="/assets/guides/getting-started/setting-system.png" alt="ClientSetup system information tab" width={455} height={304} /></section>
    <section className="setting-guide"><GuideHeading>Game tab allows you to adjust display options.</GuideHeading><ManualImage src="/assets/guides/getting-started/setting-display.png" alt="ClientSetup display settings tab with numbered options" width={711} height={475} /><ul><li><b>Graphic Card:</b> choose the graphic card installed in your computer.</li><li><b>Display Bit:</b> higher values produce better graphics.</li><li><b>Refresh Rate:</b> higher values decrease flicker on CRT monitors.</li><li><b>Display:</b> select full-screen or windowed mode.</li><li><b>Multiple Character Input:</b> enable multilingual character input.</li></ul></section>
    <section className="setting-guide"><GuideHeading>Adjust the in-game graphic options.</GuideHeading><ManualImage src="/assets/guides/getting-started/setting-game.png" alt="ClientSetup game settings tab with numbered options" width={711} height={475} /><ul><li><b>Camera Rotation:</b> clockwise or anticlockwise.</li><li><b>Mouse Shadow:</b> enables or disables the mouse trail.</li><li><b>View Name:</b> displays character and NPC names.</li><li><b>Texture Quality:</b> higher quality provides more detailed textures.</li><li><b>Graphic Quality:</b> enables or disables grass on the ground.</li></ul></section>
    <section className="setting-guide"><GuideHeading>Sound tab adjusts the client audio.</GuideHeading><ManualImage src="/assets/guides/getting-started/setting-sound.png" alt="ClientSetup sound settings tab with volume controls" width={711} height={475} /><ul><li><b>Sound Effect:</b> adjusts effects such as clicking and item use.</li><li><b>Music Effect:</b> adjusts background and battle music.</li><li><b>Ambient Effect:</b> adjusts field and environmental sounds.</li><li><b>Weather Effect:</b> adjusts rain and storm sounds.</li></ul></section>
  </>;
}

function Login() {
  return <>
    <p className="start-guide-lead">When you start the game, the login screen will appear after executing the gameguard.</p>
    <div className="login-guide-grid">
      <ManualImage className="manual-shot-login" src="/assets/guides/getting-started/login-factions.gif" alt="Game login window with five numbered controls" width={270} height={208} />
      <ol><li><b>1</b> Enter your account ID.</li><li><b>2</b> Enter your password.</li><li><b>3</b> Check this to avoid entering your account ID every time you log in.</li><li><b>4</b> Enter the game.</li><li><b>5</b> Cancel and exit the game.</li></ol>
    </div>
    <p>If you successfully logged in, you will be taken to the character selection screen. If there isn’t any character, you first need to choose your character’s nationality.</p>
    <ManualImage className="manual-shot-factions" src="/assets/guides/getting-started/login-panel.jpg" alt="Character nationality selection between Human and Ak'kan" width={500} height={391} />
    <p>You can choose a Human from Kharland or an Ak&apos;kan from Markadia. All characters created must be of the same nationality. You cannot re-choose your nationality unless you delete every character on the server and restart the game.</p>
    <section className="faction-card human"><Image src="/assets/guides/getting-started/faction-human.gif" alt="Human faction crest" width={61} height={99} /><div><strong>Kharland (Human)</strong><p>The immigrants from Great Kharland settled in Grand Cross and founded this nation. To consolidate the nation, they declared their independence and built a new capital.</p></div></section>
    <section className="faction-card akkan"><Image src="/assets/guides/getting-started/faction-akkan.gif" alt="Ak'kan faction crest" width={61} height={99} /><div><strong>Markadia (Ak&apos;kan)</strong><p>Ak&apos;kans worship the life force of Gaia formed in Lohan Spot. Their power of unity is weaker than humans, but individually they are considerably stronger.</p></div></section>
  </>;
}

function CreateCharacter() {
  return <>
    <p className="start-guide-lead">Once you have selected your nationality, you can create your character. You may create up to five characters per account.</p>
    <ManualImage className="manual-shot-wide" src="/assets/guides/getting-started/create-screen.jpg" alt="Character selection screen with an empty character slot highlighted" width={500} height={293} />
    <p>Click one of the flashing slots to register a window for creating a character. Select a Class, enter a name, choose the appearance and distribute the starting stat points.</p>
    <GuideHeading>Character Creation</GuideHeading>
    <div className="character-guide-grid"><ManualImage className="manual-shot-character" src="/assets/guides/getting-started/create-fields.gif" alt="Create Character panel with appearance and stat controls" width={200} height={423} /><ol className="character-fields">
      <Step number={1} title="Name">Enter the name of your character. It must be unique and may contain supported letters and numbers.</Step>
      <Step number={2} title="Gender">Select the character’s gender where the chosen Class allows it.</Step>
      <Step number={3} title="Hairstyle">Select a hairstyle.</Step>
      <Step number={4} title="Face">Select a facial appearance.</Step>
      <Step number={5} title="Attire">Choose a starting attire variation.</Step>
      <Step number={6} title="Class">Choose one of the available Classes and review its role before continuing.</Step>
      <Step number={7} title="Rotation">Rotate your character 360 degrees to review the appearance.</Step>
    </ol></div>
    <GuideHeading>Basic Stats</GuideHeading>
    <p>The basic stats are STR, DEX, CON, INT and WIS. Their values vary between Classes. Each stat influences different attributes and can be increased with available points.</p>
    <dl className="stat-list"><div><dt>STR</dt><dd>Strength affects physical attack power.</dd></div><div><dt>DEX</dt><dd>Dexterity affects accuracy, evasion and attack speed.</dd></div><div><dt>CON</dt><dd>Constitution determines maximum HP and physical defense.</dd></div><div><dt>INT</dt><dd>Intelligence determines magic power and maximum MP.</dd></div><div><dt>WIS</dt><dd>Wisdom determines magic resistance and MP recovery.</dd></div><div><dt>Bonus Point</dt><dd>Available points can be assigned to the stats that best fit your Class.</dd></div></dl>
    <section className="start-callout"><Info /><p>Each character automatically gains certain stats at each level. Please consider your chosen Class and desired build before assigning Bonus Points.</p></section>
  </>;
}

const pages: Record<StartPageSlug, () => ReactNode> = {
  "getting-ready": GettingReady,
  installation: Installation,
  launcher: Launcher,
  "client-setting": ClientSetting,
  login: Login,
  "create-character": CreateCharacter,
};

export function GettingStartedContent({ slug }: { slug: string }) {
  const Page = pages[slug as StartPageSlug];
  return Page ? <div className="start-guide-content"><Page /></div> : null;
}
