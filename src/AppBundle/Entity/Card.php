<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Card
 *
 * @ORM\Table(name="card")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\CardRepository")
 */


class Card
{
    
    CONST TYPES=array(
        'Damage', // attack only
        'Buff', // boost la base donc = attack ET defense
        'Defense', // defense only
        'Special',
        'Perma'
    );
    
     CONST IMAGES_FOLDER = '/uploads/cards/';
    
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=255, unique=true)
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(name="type", type="string", length=255)
     */
    private $type;

    /**
     * @var int
     *
     * @ORM\Column(name="karma", type="integer")
     */
    private $karma;

    /**
     * @var int
     *
     * @ORM\Column(name="sanity", type="integer")
     */
    private $sanity;

    /**
     * @var int
     *
     * @ORM\Column(name="sex", type="integer")
     */
    private $sex;
    
  
    
    

    /**
     * @var string
     *
     * @ORM\Column(name="special_name", type="string", length=255, nullable=true)
     */
    private $specialName;

    /**
     * @var int
     *
     * @ORM\Column(name="turns", type="integer")
     */
    private $turns;
    
    /**
     * @var int
     *
     * @ORM\Column(name="cardvalue", type="integer")
     */
    private $cardvalue;

    /**
     * @var int     *
     * @ORM\Column(name="frequency", type="integer")
     */
    private $frequency;

    /**
     * @var string     *
     * @ORM\Column(name="description", type="text", length=65535)
     */
    private $description;

    /**
     * @var string     *
     * @ORM\Column(name="file", type="string", length=255, nullable=true)
     */
    private $file;
    
     /**
     * @var int
     *
     * @ORM\Column(name="popularity", type="integer",nullable=true)
     */
    private $popularity;
   
    
    
    /**
     * Get id
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set name
     *
     * @param string $name
     *
     * @return Card
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set type
     *
     * @param string $type
     *
     * @return Card
     */
    public function setType($type)
    {
        $this->type = $type;

        return $this;
    }

    /**
     * Get type
     *
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * Set karma
     *
     * @param integer $karma
     *
     * @return Card
     */
    public function setKarma($karma)
    {
        $this->karma = $karma;

        return $this;
    }

    /**
     * Get karma
     *
     * @return int
     */
    public function getKarma()
    {
        return $this->karma;
    }
    
    
    /**
     * Set cardvalue
     *
     * @param integer $cardvalue
     *
     * @return Card
     */
    public function setCardvalue($cardvalue)
    {
        $this->cardvalue = $cardvalue;

        return $this;
    }

    /**
     * Get cardvalue
     *
     * @return int
     */
    public function getCardvalue()
    {
        return $this->cardvalue;
    }
    

    /**
     * Set sanity
     *
     * @param integer $sanity
     *
     * @return Card
     */
    public function setSanity($sanity)
    {
        $this->sanity = $sanity;

        return $this;
    }

    /**
     * Get sanity
     *
     * @return int
     */
    public function getSanity()
    {
        return $this->sanity;
    }

    /**
     * Set sex
     *
     * @param integer $sex
     *
     * @return Card
     */
    public function setSex($sex)
    {
        $this->sex = $sex;

        return $this;
    }

    /**
     * Get sex
     *
     * @return int
     */
    public function getSex()
    {
        return $this->sex;
    }

    /**
     * Set specialName
     *
     * @param string $specialName
     *
     * @return Card
     */
    public function setSpecialName($specialName)
    {
        $this->specialName = $specialName;

        return $this;
    }

    /**
     * Get specialName
     *
     * @return string
     */
    public function getSpecialName()
    {
        return $this->specialName;
    }

    /**
     * Set turns
     *
     * @param integer $turns
     *
     * @return Card
     */
    public function setTurns($turns)
    {
        $this->turns = $turns;

        return $this;
    }

    /**
     * Get turns
     *
     * @return int
     */
    public function getTurns()
    {
        return $this->turns;
    }

    /**
     * Set frequency
     *
     * @param integer $frequency
     *
     * @return Card
     */
    public function setFrequency($frequency)
    {
        $this->frequency = $frequency;

        return $this;
    }

    /**
     * Get frequency
     *
     * @return int
     */
    public function getFrequency()
    {
        return $this->frequency;
    }

    /**
     * Set description
     *
     * @param string $description
     *
     * @return Card
     */
    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Get description
     *
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }
    
    
     /**
     * Sets file.
     *
     * @param string $file
     */
    public function setFile($file)
    {
        $this->file = $file;
    }

    /**
     * Get file.
     *
     * @return string
     */
    public function getFile()
    {
        return $this->file;
    }
    /**
     * Sets popularity.
     *
     * @param int $popularity
     */
    public function setPopularity($popularity = null) {
        $this->popularity = $popularity;
    }

    /**
     * Get popularity.
     *
     * @return int
     */
    public function getPopularity() {
        return $this->popularity;
    }
    
    
    
    public function calculateValue()
    {
        $this->cardvalue = $this->karma + $this->sex + $this->sanity - ($this->turns * 10);
        $this->frequency = 100 - $this->karma + $this->sex + $this->sanity - ($this->turns * 10);
    }
    
}

