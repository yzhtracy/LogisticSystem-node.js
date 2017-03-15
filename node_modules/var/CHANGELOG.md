# 0.1.3 (2015-01-23)
* Log errors and exit the process instead of throwing exceptions to avoid showing the stack, which is too verbose

# 0.1.2 (2015-01-23)
* Fixed encoding when reading the configuration file

# 0.1.1 (2014-12-04)

* Added support for custom file path via the `ENV_VAR_CONFIG_FILE` environment variable
* Added the variable key to more error messages
* Replaced custom test scripts with https://github.com/caolan/nodeunit
