let overrideSessionID = '';
let activeConnectBtn = null;
const match = location.pathname.match(/\/(\d+)\//);
const gameID = match ? match[1] : null;
if (!gameID || !location.href.startsWith(location.origin + '/games/play/')) return;
const originalOpen = XMLHttpRequest.prototype.open;
const originalSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;
    return originalOpen.apply(this, arguments);
};

XMLHttpRequest.prototype.send = function(body) {
    if (this._url && this._url.includes('/locator/session/') && overrideSessionID) {
        try {
            let data = JSON.parse(body);
            if (data && data.sessionID) {
                data.sessionID = overrideSessionID;
                body = JSON.stringify(data);
            }
        } catch (e) {
        }
    }
    return originalSend.apply(this, [body]);
};

function createStyledPanel() {
    if (document.getElementById('tm-server-panel-container')) return;

    const panelContainer = document.createElement('div');
    panelContainer.id = 'tm-server-panel-container';
    Object.assign(panelContainer.style, {
        position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'none', justifyContent: 'center',
        alignItems: 'center', zIndex: '99999', fontFamily: 'Open Sans,sans-serif'
    });

    panelContainer.innerHTML = `
            <div style="background-color: #333333; color: white; position: relative; max-width: 600px; width: 100%; border-radius: 4px; box-shadow: 0px 11px 15px -7px rgba(0,0,0,0.2); --Paper-shadow: 0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12); --Paper-overlay: linear-gradient(rgba(255, 255, 255, 0.165), rgba(255, 255, 255, 0.165));">
                <h2 style="padding: 16px 24px; margin: 0; font-weight: 600; font-size: 1.25rem; solid #333;">
                    Servers (refresh page to revert to default server)
                </h2>
                <button id="close-panel" style="position: absolute; right: 8px; top: 8px; color: white; background: transparent; border: none; cursor: pointer; padding: 8px;">
                    <svg viewBox="0 0 352 512" height="1.5em" width="1.5em"><path fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path></svg>
                </button>
                <div style="background-color: #0000001a; padding: 10px 24px; max-height: 300px; overflow-y: auto;" id="session-list-container">
                    <div style="font-size: 13px; text-align: center; padding: 20px;">No servers found.</div>
                </div>
                <div style="background-color: #333333; display: flex; align-items: center; justify-content: flex-end; padding: 16px 24px; solid #333;">
                    <button id="cancel-btn" style="color: white; background: transparent; border: none; padding: 6px 16px; cursor: pointer; font-weight: 600;">
                        Cancel
                    </button>
                    <button id="fetch-server-btn" style="background-color: #e62600; color: white; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer; font-weight: 600; margin-left: 8px;">
                        Fetch
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(panelContainer);
    const hidePanel = () => { panelContainer.style.display = 'none'; };
    panelContainer.querySelector('#close-panel').onclick = hidePanel;
    panelContainer.querySelector('#cancel-btn').onclick = hidePanel;
    panelContainer.onclick = (e) => { if(e.target === panelContainer) hidePanel(); };
    const fetchBtn = panelContainer.querySelector('#fetch-server-btn');
    const listContainer = panelContainer.querySelector('#session-list-container');

    fetchBtn.onclick = async () => {
        fetchBtn.innerText = 'Loading...';
        try {
            const response = await fetch(`${location.origin}/locator/session/?objectID=${gameID}&profileID=0&lang=en_US&type=play&referrer=kogama`);
            const data = await response.json();

            if (listContainer.innerText.includes('No servers')) listContainer.innerHTML = '';

            if (data.sessionID) {
                const currentIndex = listContainer.children.length + 1;
                const sessionID = data.sessionID;

                const row = document.createElement('div');
                Object.assign(row.style, {
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0'
                });

                row.innerHTML = `
    <div>
        <div style="color: #81c784; font-weight: bold;">Scan #${currentIndex}</div>
        <div style="font-family: monospace; font-size: 11px; color: #aaa;">${sessionID}</div>
    </div>
    <button class="connect-btn" style="background: #1976d2; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold; min-width: 85px;">
        Connect
    </button>
`;
                const connectBtn = row.querySelector('.connect-btn');
                connectBtn.onclick = () => {
                    if (activeConnectBtn && activeConnectBtn !== connectBtn) {
                        activeConnectBtn.innerText = 'Connect';
                        activeConnectBtn.style.backgroundColor = '#1976d2';
                    }
                    overrideSessionID = sessionID;
                    connectBtn.innerText = 'Connected';
                    connectBtn.style.backgroundColor = '#2e7d32';
                    activeConnectBtn = connectBtn;
                };
                listContainer.appendChild(row);
                listContainer.appendChild(row);
                listContainer.scrollTop = listContainer.scrollHeight;
            }
        } catch (err) {
            console.error('Fetch failed', err);
        } finally {
            fetchBtn.innerText = 'Find Servers';
        }
    };
}

function createServerButton() {
    const btn = document.createElement('button');
    btn.id = 'tm-server-btn';
    Object.assign(btn.style, {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxSizing: 'border-box',
        cursor: 'pointer',
        userSelect: 'none',
        verticalAlign: 'middle',
        appearance: 'none',
        fontWeight: '700',
        fontFamily: '"Open Sans", sans-serif',
        lineHeight: '1.75',
        minWidth: '64px',
        fontSize: '0.8125rem',
        outline: '0px',
        textDecoration: 'none',
        border: '0px',
        borderRadius: '4px',
        padding: '4px 10px',
        color: '#fff',
        backgroundColor: '#35353f',
        boxShadow: 'rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px',
        transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1)'
    });
    btn.innerHTML = `
            <svg viewBox="0 0 640 640" style="width: 1.5em; height: 1.5em; margin-right: 8px;">
                <path fill="currentColor" d="M160 96C124.7 96 96 124.7 96 160L96 224C96 259.3 124.7 288 160 288L480 288C515.3 288 544 259.3 544 224L544 160C544 124.7 515.3 96 480 96L160 96zM376 168C389.3 168 400 178.7 400 192C400 205.3 389.3 216 376 216C362.7 216 352 205.3 352 192C352 178.7 362.7 168 376 168zM432 192C432 178.7 442.7 168 456 168C469.3 168 480 178.7 480 192C480 205.3 469.3 216 456 216C442.7 216 432 205.3 432 192zM160 352C124.7 352 96 380.7 96 416L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 416C544 380.7 515.3 352 480 352L160 352zM376 424C389.3 424 400 434.7 400 448C400 461.3 389.3 472 376 472C362.7 472 352 461.3 352 448C352 434.7 362.7 424 376 424zM432 448C432 434.7 442.7 424 456 424C469.3 424 480 434.7 480 448C480 461.3 469.3 472 456 472C442.7 472 432 461.3 432 448z"></path>
            </svg>
            <span>Servers</span>
        `;

    btn.onclick = (e) => {
        e.stopPropagation();
        document.getElementById('tm-server-panel-container').style.display = 'flex';
    };
    return btn;
}
createStyledPanel();

new MutationObserver(() => {
    const container = document.querySelector('._2blPL');
    if (container && !document.getElementById('tm-server-btn')) {
        container.appendChild(createServerButton());
    }
}).observe(document.body, { childList: true, subtree: true });
