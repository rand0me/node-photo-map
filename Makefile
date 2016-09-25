push-all: push-github push-openshift

push-openshift:
	git push openshift master

push-github:
	git push origin master
