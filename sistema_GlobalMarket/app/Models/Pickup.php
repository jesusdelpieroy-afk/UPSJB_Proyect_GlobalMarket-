<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pickup extends Model
{
    protected $fillable = [
        'order_id',
        'fecha',
        'hora',
        'estado',
        'responsable',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}