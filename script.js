searchInput = document.querySelector('.MuiInputBase-input.MuiOutlinedInput-input.css-3pzf3f');
filterButton = document.querySelector('.MuiInputBase-root.MuiOutlinedInput-root.MuiInputBase-colorPrimary.MuiInputBase-formControl.css-1twwtyu');
searchButton = document.querySelector('.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.MuiButton-colorPrimary.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.MuiButton-colorPrimary._1Pmt0.css-rqc8s9');
dropdown = document.querySelector('.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiPopover-paper.MuiMenu-paper.MuiMenu-paper.css-a9ykpb');
dropdownInput = document.querySelector('.MuiSelect-nativeInput.css-1k3x8v3');
dropdownAll = document.querySelector('[data-value="all"]');
dropdownThemes = document.querySelector('[data-value="themes"]');
dropdownScripts = document.querySelector('[data-value="scripts"]');
let plugins = [];
filterButton.addEventListener('click', function () {
    if (dropdown.style.display === 'none') {
        dropdown.style.display = 'block';
        if (dropdownInput.value === 'all') {
            dropdownAll.className = 'MuiButtonBase-root MuiMenuItem-root MuiMenuItem-gutters Mui-selected MuiMenuItem-root MuiMenuItem-gutters Mui-selected css-511ehs';
            dropdownThemes.className = 'MuiButtonBase-root MuiMenuItem-root MuiMenuItem-gutters MuiMenuItem-root MuiMenuItem-gutters css-511ehs';
            dropdownScripts.className = 'MuiButtonBase-root MuiMenuItem-root MuiMenuItem-gutters MuiMenuItem-root MuiMenuItem-gutters css-511ehs';
        }
        if (dropdownInput.value === 'themes') {
            dropdownAll.className = 'MuiButtonBase-root MuiMenuItem-root MuiMenuItem-gutters MuiMenuItem-root MuiMenuItem-gutters css-511ehs';
            dropdownThemes.className = 'MuiButtonBase-root MuiMenuItem-root MuiMenuItem-gutters Mui-selected MuiMenuItem-root MuiMenuItem-gutters Mui-selected css-511ehs';
            dropdownScripts.className = 'MuiButtonBase-root MuiMenuItem-root MuiMenuItem-gutters MuiMenuItem-root MuiMenuItem-gutters css-511ehs';
        }
        if (dropdownInput.value === 'scripts') {
            dropdownAll.className = 'MuiButtonBase-root MuiMenuItem-root MuiMenuItem-gutters MuiMenuItem-root MuiMenuItem-gutters css-511ehs';
            dropdownThemes.className = 'MuiButtonBase-root MuiMenuItem-root MuiMenuItem-gutters MuiMenuItem-root MuiMenuItem-gutters css-511ehs';
            dropdownScripts.className = 'MuiButtonBase-root MuiMenuItem-root MuiMenuItem-gutters Mui-selected MuiMenuItem-root MuiMenuItem-gutters Mui-selected css-511ehs';
        }
    }
    else {
        dropdown.style.display = 'none';
    }
});
dropdownAll.addEventListener('click', function () {
    dropdownInput.value = "all";
    document.querySelector('.MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input.css-14khp7z').innerText = "All";
    dropdown.style.display = 'none';
});
dropdownThemes.addEventListener('click', function () {
    dropdownInput.value = "themes";
    document.querySelector('.MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input.css-14khp7z').innerText = "Themes";
    dropdown.style.display = 'none';
});
dropdownScripts.addEventListener('click', function () {
    dropdownInput.value = "scripts";
    document.querySelector('.MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input.css-14khp7z').innerText = "Scripts";
    dropdown.style.display = 'none';
});
document.addEventListener('click', function (e) {
    const isClickInsideFilterButton = filterButton.contains(e.target);
    const isClickInsideDropdown = dropdown.contains(e.target);
    if (!isClickInsideFilterButton && !isClickInsideDropdown) {
        dropdown.style.display = 'none';
    }
});
searchButton.addEventListener('click', function (e) {
    e.preventDefault();
    loadPlugins(searchInput.value, dropdownInput.value);
});
function applyFilters(searchQuery, typeValue) {
    const pluginContainer = document.getElementById('plugins-container');
    let filteredPlugins = plugins.filter(plugin => {
        if (typeValue === 'all' && plugin.Title.includes(searchQuery)) return true;
        return plugin.Type.toLowerCase() === typeValue && plugin.Title.includes(searchQuery);
    });
    if (filteredPlugins.length === 0) {
        pluginContainer.innerText = `No plugins found. Maybe you could suggest a feature to @ddocskgm!`;
        return;
    }
    const listHTML = `
        <div>
            ${filteredPlugins.map(info => `
                <div>
                    <div class="plugin-toggle">
                        <label class="type-label">${(info.Type === 'themes') ? 'theme' : (info.Type === 'scripts') ? 'script' : 'all'}</label>
                        <label class="toggle">
                            <input type="checkbox">
                            <span class="slider round"></span>
                        </label>
                    </div>
                    <div class="plugin-info">
                        <h2 class="plugin-title">${info.Title}</h2>
                        <p class="plugin-description ">${info.Description}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    pluginContainer.innerHTML = listHTML;
    document.querySelectorAll('.toggle input[type="checkbox"]').forEach(toggle => {
        fetch(`https://raw.githubusercontent.com/HelperKoGaMa404/PluGaMa/refs/heads/main/plugins.json`).then(response => {
            if (response.ok) {
                return response.json();
            }
        }).then(data => {
            data.forEach(plugin => {
                if (plugin.title === toggle.parentElement.parentElement.parentElement.querySelector('.plugin-info .plugin-title').innerText) {
                    fetch(chrome.runtime.getURL(`plugins/${plugin.source_code}`)).then(response => {
                        if (response) {
                            async function loadEnabledPlugins() {
                                key = await chrome.storage.local.get([toggle.parentElement.parentElement.parentElement.querySelector('.plugin-info .plugin-title').innerText]);
                                toggle.checked = key[toggle.parentElement.parentElement.parentElement.querySelector('.plugin-info .plugin-title').innerText];
                            }
                            loadEnabledPlugins();
                            toggle.addEventListener('click', function (e) {
                                chrome.storage.local.set({[e.target.parentElement.parentElement.parentElement.querySelector('.plugin-info .plugin-title').innerText]: e.target.checked});
                            });
                        }
                    }).catch(error => {
                        const downloadButton = document.createElement('i');
                        downloadButton.className = 'fa-light fa-download';
                        toggle.parentElement.appendChild(downloadButton);
                        downloadButton.addEventListener('click', function () {
                            if (plugin.title === downloadButton.parentElement.parentElement.parentElement.querySelector('.plugin-info .plugin-title').innerText) {
                                chrome.downloads.download({
                                    url: `https://raw.githubusercontent.com/HelperKoGaMa404/PluGaMa/refs/heads/main/plugins/${plugin.source_code}`,
                                    filename: plugin.source_code,
                                    saveAs: true
                                });
                            }
                        });
                        toggle.parentElement.querySelector('.slider.round').remove();
                        toggle.remove();
                    });
                }
            });
        });
    });
}
function loadPlugins(searchQuery, typeValue) {
    fetch(`https://raw.githubusercontent.com/HelperKoGaMa404/PluGaMa/refs/heads/main/plugins.json`).then(response => {
        if (response.ok) {
            return response.json();
        }
    }).then(data => {
        plugins = data.map(plugin => ({
            Title: plugin.title,
            Description: plugin.description,
            Type: plugin.type,
            SourceCode: plugin.source_code
        }));
        applyFilters(searchQuery, typeValue);
    }).catch(error => {
        document.getElementById('plugins-container').innerText = `Error loading plugins`;
    });
}
loadPlugins(searchInput.value, dropdownInput.value);
