# CodeIgniter 4, React, JWT auth, SPA

## CodeIgniter 4 Application Starter

Steps to reproduce:-

```bash
# Create app
composer create-project codeigniter4/appstarter ci-jwt-react
cd ci-jwt-react

# add jwt package
composer require firebase/php-jwt

php spark serve
# Navigate to http://localhost:8080

```

## Environment Variables Setup

```bash
cp env .env
# edit .env as bellow
CI_ENVIRONMENT=development

database.default.hostname = localhost
database.default.database = YOUR_DATABASE
database.default.username = YOUR_DATABASE_USERNAME
database.default.password = YOUR_DATABASE_PASSWORD
database.default.DBDriver = MySQLi

JWT_SECRET_KEY=kzUf4sxss4AeG5uHkNZAqT1NyqwezVf1z
JWT_TIME_TO_LIVE=3600
```

## Migration and seeders

```bash
php spark migrate:create user
```

```php
<?php
// app/Database/Migrations/xxxxxx-xxx-user.php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class Users extends Migration
{
	public function up()
	{
		$this->forge->addField([
			'id'          => [
				'type'           => 'INT',
				'constraint'     => 5,
				'unsigned'       => true,
				'auto_increment' => true,
			],
			'name'       => [
				'type'     	=> 'VARCHAR',
				'constraint' => '100',
			],
			'email'       => [
				'type'     	=> 'VARCHAR',
				'constraint' => '100',
			],
			'password' => [
				'type'           => 'VARCHAR',
				'constraint' => '255',
				'null'           => false,
			],
			'role' => [
				'type'           => 'ENUM("ROOT","ADMIN","USER")',
				'default' 		 => 'USER',
				'null'           => false,
			],
		]);
		$this->forge->addKey('id', true);
		$this->forge->createTable('user');
	}

	//--------------------------------------------------------------------

	public function down()
	{
		$this->forge->dropTable('users');
	}
}
```

```bash
php spark migrate
```

## Create Model User

```php
<?php
// app/Models/UserModel.php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class UserModel extends Model
{
	protected $table = 'user';
	protected $allowedFields = [
		'name',
		'email',
		'password',
		'role'
	];
	protected $updatedField = 'updated_at';

	protected $beforeInsert = ['beforeInsert'];
	protected $beforeUpdate = ['beforeUpdate'];

	protected function beforeInsert(array $data): array
	{
		return $this->getUpdatedDataWithHashedPassword($data);
	}

	protected function beforeUpdate(array $data): array
	{
		return $this->getUpdatedDataWithHashedPassword($data);
	}

	private function getUpdatedDataWithHashedPassword(array $data): array
	{
		if (isset($data['data']['password'])) {
			$plaintextPassword = $data['data']['password'];
			$data['data']['password'] = $this->hashPassword($plaintextPassword);
		}
		return $data;
	}

	private function hashPassword(string $plaintextPassword): string
	{
		return password_hash($plaintextPassword, PASSWORD_BCRYPT);
	}

	public function findUserByEmailAddress(string $emailAddress)
	{
		$user = $this
			->asArray()
			->where(['email' => $emailAddress])
			->first();

		if (!$user)
			throw new Exception('User does not exist for specified email address');

		return $user;
	}
}
```

## Create JWT Helper

```php
// app/Helpers/jwt_helper.php
<?php

use App\Models\UserModel;
use Config\Services;
use Firebase\JWT\JWT;

function getJWTFromRequest($authenticationHeader): string
{
	if (is_null($authenticationHeader)) { //JWT is absent
		throw new Exception('Missing or invalid JWT in request');
	}
	//JWT is sent from client in the format Bearer XXXXXXXXX
	return explode(' ', $authenticationHeader)[1];
}

function validateJWTFromRequest(string $encodedToken)
{
	$key = Services::getSecretKey();
	$decodedToken = JWT::decode($encodedToken, $key, ['HS256']);
	$userModel = new UserModel();
	$userModel->findUserByEmailAddress($decodedToken->email);
}

function getSignedJWTForUser(string $email)
{
	$issuedAtTime = time();
	$tokenTimeToLive = getenv('JWT_TIME_TO_LIVE');
	$tokenExpiration = $issuedAtTime + $tokenTimeToLive;
	$payload = [
		'email' => $email,
		'iat' => $issuedAtTime,
		'exp' => $tokenExpiration,
	];

	$jwt = JWT::encode($payload, Services::getSecretKey());
	return $jwt;
}

```

## Create Authentication Filter

```php
// app/Filters/JWTAuthenticationFilter.php
<?php

namespace App\Filters;

use CodeIgniter\API\ResponseTrait;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Services;
use Exception;

class JWTAuthenticationFilter implements FilterInterface
{
	use ResponseTrait;

	public function before(RequestInterface $request, $arguments = null)
	{
		$authenticationHeader = $request->getServer('HTTP_AUTHORIZATION');

		try {

			helper('jwt');
			$encodedToken = getJWTFromRequest($authenticationHeader);
			validateJWTFromRequest($encodedToken);
			return $request;
		} catch (Exception $e) {

			return Services::response()
				->setJSON(
					[
						'error' => $e->getMessage()
					]
				)
				->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED);
		}
	}

	public function after(
		RequestInterface $request,
		ResponseInterface $response,
		$arguments = null
	) {
	}
}
```

## Filters Setup

Register your JWTAuthentication filter and specify the route you want it to protect. This is done in the App/Config/Filters.php file. Update the `$aliases` and `$filters` array as follows:

```php
// in your app/Config/Filters.php
use App\Filters\JWTAuthenticationFilter;
public $aliases = [
		'csrf'     => CSRF::class,
		'toolbar'  => DebugToolbar::class,
		'honeypot' => Honeypot::class,
		'auth' => JWTAuthenticationFilter::class,
	];

// and filters like this
	public $filters = [
		'auth' => [
			'before' => [
				'client/*',
				'client'
			],
		]
	];

```

By now if you visit `http://localhost:8080/client` you will be asked for JWT valid token

## BaseController.php

Now open `App/Controllers/BaseController.php` and add the following methods

```php
// in App/Controllers/BaseController.php
// use CodeIgniter\HTTP\ResponseInterface;
// use CodeIgniter\HTTP\IncomingRequest;
// use CodeIgniter\Validation\Exceptions\ValidationException;
// use Config\Services;


public function getResponse(array $responseBody,
                            int $code = ResponseInterface::HTTP_OK)
{
    return $this
        ->response
        ->setStatusCode($code)
        ->setJSON($responseBody);
}

// and

public function getRequestInput(IncomingRequest $request){
    $input = $request->getPost();
    if (empty($input)) {
        //convert request body to associative array
        $input = json_decode($request->getBody(), true);
    }
    return $input;
}

// and

public function validateRequest($input, array $rules, array $messages =[]){
    $this->validator = Services::Validation()->setRules($rules);
    // If you replace the $rules array with the name of the group
    if (is_string($rules)) {
        $validation = config('Validation');

        // If the rule wasn't found in the \Config\Validation, we
        // should throw an exception so the developer can find it.
        if (!isset($validation->$rules)) {
            throw ValidationException::forRuleNotFound($rules);
        }

        // If no error message is defined, use the error message in the Config\Validation file
        if (!$messages) {
            $errorName = $rules . '_errors';
            $messages = $validation->$errorName ?? [];
        }

        $rules = $validation->$rules;
    }
    return $this->validator->setRules($rules, $messages)->run($input);
}
```

## User Validation

```php
// add folder and file to app/Validation/UserRules.php
<?php

namespace App\Validation;

use App\Models\UserModel;
use Exception;

class UserRules
{
    public function validateUser(string $str, string $fields, array $data): bool
    {
        try {
            $model = new UserModel();
            $user = $model->findUserByEmailAddress($data['email']);
            return password_verify($data['password'], $user['password']);
        } catch (Exception $e) {
            return false;
        }
    }
}

```

Next, open the App/Config/Validation.php file and modify the `$ruleSets` array to include your UserRules. `$ruleSets` should look like this:

```php
public $ruleSets = [
    \CodeIgniter\Validation\Rules::class,
    \CodeIgniter\Validation\FormatRules::class,
    \CodeIgniter\Validation\FileRules::class,
    \CodeIgniter\Validation\CreditCardRules::class,
    \App\Validation\UserRules::class,
];
```

## Authentication Controller

Next, create a file name Auth.php in the App/Controllers directory, please refer the file in the repo.

## Create Client Controller

For the client controller, we will specify the routes in the app/Config/Routes.php file. Open the file and add the following routes:

```php
$routes->get('client', 'Client::index');
$routes->post('client', 'Client::store');
$routes->get('client/(:num)', 'Client::show/$1');
$routes->post('client/(:num)', 'Client::update/$1');
$routes->delete('client/(:num)', 'Client::destroy/$1');
```
