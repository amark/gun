Every push or pull request will

 - run the tests

Every push to master will

 - run the tests
 - publish the latest docker image to dockerhub

Creating a tag that starts with `v` will

 - create a new github release
 - publish the release to npm
 - publish the release to dockerhub

Creating a release from the github web interface will

 - publish the release to npm
 - publish the release to dockerhub

Creating the release for version `0.2021.001` from the command line works as follows

    git tag v0.2021.001
    git push --tags

