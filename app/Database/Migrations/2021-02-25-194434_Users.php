<?php

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
