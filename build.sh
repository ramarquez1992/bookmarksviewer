cp -r ./ ~/bookmarksviewer
cd ~/bookmarksviewer
sudo rm -r .hg* .*.swp screenshots build.sh
cd ../
zip -r x.zip bookmarksviewer
rm -r bookmarksviewer

