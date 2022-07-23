git clone https://github.com/aghriss/Zellij.git
kpackagetool5 -i Zellij
mkdir -p ~/.local/share/kservices5
ln -sf ~/.local/share/kwin/scripts/zellij-tiles/metadata.desktop ~/.local/share/kservices5/zellij-tiles.desktop