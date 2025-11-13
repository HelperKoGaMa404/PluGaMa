chrome.storage.local.get(null, (items) => {
    for (const key in items) {
        if (Object.hasOwnProperty.call(items, key)) {
            const value = items[key];
            if (value === true) {
                fetch(`https://raw.githubusercontent.com/HelperKoGaMa404/PluGaMa/refs/heads/main/plugins.json`).then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                }).then(plugins => {
                    plugins.forEach(plugin => {
                        if (plugin.title === key) {
                            pluginInject = document.createElement('script');
                            pluginInject.src = chrome.runtime.getURL(`plugins/${plugin.source_code}`);
                            document.body.appendChild(pluginInject)
                        }
                    });
                }).catch(error => {
                    console.error('Error loading plugin: ' + error);
                });
            }
        }
    }
});