<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'nombreCliente',
        'telefono',
        'correo',
        'contenido',
        'fecha',
        'estado',
    ];
}