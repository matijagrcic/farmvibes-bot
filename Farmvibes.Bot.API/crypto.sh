echo "Preparing secrets"
export SYMFONY_DECRYPTION_SECRET="${PROD_ENCRYPTION_KEY:0:100}"
echo -n "${JWT_SECRET_KEY:0:100}" | APP_RUNTIME_ENV=prod php bin/console secrets:set JWT_SECRET_KEY -
echo -n "${BLOB_STORAGE_CONNECTION_STRING:0:190}" | APP_RUNTIME_ENV=prod php bin/console secrets:set BLOB_STORAGE_CONNECTION_STRING -
echo -n "${DATABASE_URL:0:133}" | APP_RUNTIME_ENV=prod php bin/console secrets:set DATABASE_URL -
echo -n "${TRANSLATOR_LOCATION:0:100}" | APP_RUNTIME_ENV=prod php bin/console secrets:set TRANSLATOR_LOCATION -
echo -n "${TRANSLATOR_TEXT_ENDPOINT:0:100}" | APP_RUNTIME_ENV=prod php bin/console secrets:set TRANSLATOR_TEXT_ENDPOINT -
echo -n "${CORS_ALLOW_ORIGIN:0:127}" | APP_RUNTIME_ENV=prod php bin/console secrets:set CORS_ALLOW_ORIGIN -
echo -n "${TRANSLATOR_TEXT_SUBSCRIPTION_KEY:0:100}" | APP_RUNTIME_ENV=prod php bin/console secrets:set TRANSLATOR_TEXT_SUBSCRIPTION_KEY -
echo -n "${TRANSLATOR_LANGUAGE_PATH:0:100}" | APP_RUNTIME_ENV=prod php bin/console secrets:set TRANSLATOR_LANGUAGE_PATH -
echo -n "${TRANSLATOR_TEXT_PATH:0:100}" | APP_RUNTIME_ENV=prod php bin/console secrets:set TRANSLATOR_TEXT_PATH -
echo -n "${JWT_PUBLIC_KEY:0:100}" | APP_RUNTIME_ENV=prod php bin/console secrets:set JWT_PUBLIC_KEY -
echo -n "${JWT_PASSPHRASE:0:100}" | APP_RUNTIME_ENV=prod php bin/console secrets:set JWT_PASSPHRASE -
echo -n "${MYSQL_CA_CERT:0:100}" | APP_RUNTIME_ENV=prod php bin/console secrets:set MYSQL_CA_CERT -
echo "Generating local secrets .env file to improve performance"
APP_RUNTIME_ENV=prod php bin/console secrets:decrypt-to-local --force --env=prod
echo "Generating local file for all env"
composer dump-env prod