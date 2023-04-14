<?php
namespace App\Security;

use App\Repository\AdminUserRepository;
use App\Entity\AdminUser;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use TheNetworg\OAuth2\Client\Provider\Azure;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Component\Cache\Adapter\AbstractAdapter;
use Symfony\Component\Cache\Adapter\ApcuAdapter;
use Firebase\JWT\JWT;
use Firebase\JWT\SignatureInvalidException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Doctrine\Persistence\ManagerRegistry;

class AccessTokenHandler implements AccessTokenHandlerInterface
{
    #[Azure]
    private $provider;
    #[AbstractAdapter]
    private $cache;
    private $refreshDelayStandard = 3600 * 24; // One day
    private $refreshDelayShort = 60 * 5; // 5 minutes
    private $repository;
    private $doctrine;

    public function __construct(AdminUserRepository $repository, ManagerRegistry $doctrine) {
        $this->provider = new Azure([
            'clientId'          => $_ENV['AZURE_CLIENT_ID'],
            'clientSecret'      => $_ENV['AZURE_CLIENT_SECRET'],
            'defaultEndPointVersion' => '2.0'
        ]);
        $this->cache = new ApcuAdapter($_ENV['APCU_ADAPTER_KEY']);
        $this->repository = $repository;
        $this->doctrine = $doctrine;
    }

    // One day cached keys
    private function getKeys($force = false)
    {
        return $this->cache->get('microsoft-keys', function (ItemInterface $item) {
            $item->expiresAfter($this->refreshDelayStandard);
            return $this->provider->getJwtVerificationKeys();
        }, $force ? INF : 1.0);
    }

    // 5 minutes cached keys
    private function getKeysShort()
    {
        return $this->cache->get('microsoft-keys-short', function (ItemInterface $item) {
            $item->expiresAfter($this->refreshDelayShort);
            // Forces the one day cache refresh
            return $this->getKeys(true);
        });
    }

    public function getUserBadgeFrom(string $accessToken): UserBadge
    {
        $entityManager = $this->doctrine->getManager();
        foreach ([0, 1] as $try) {
            $firstTry = $try === 0;
            try {
                // First tries to use the "one day" cached keys, then falls back on the "5 minutes" cache
                // (if signature check failed) which forces the "one day" cache refresh
                $keys = $firstTry ? $this->getKeys() : $this->getKeysShort();
                $keyInfo = (array)JWT::decode($accessToken, $keys);

                if(array_key_exists('email', $keyInfo))
                {
                    //We need to check if user exists on our DB, if not add them before returning passport.
                    $user = $this->repository->findOneByEmail($keyInfo['email']);
                    $datetime = $datetime = (new \DateTimeImmutable())->setTimestamp($keyInfo['auth_time']);
                    if(!$user)
                    {
                        $name = explode(' ',$keyInfo['name']);
                        $user = new AdminUser();
                        $user->setEmail($keyInfo['email']);
                        $user->setFirstName(implode(' ',array_splice($name,count($name)-1)));
                        $user->setSurname($name[count($name)-1]);
                        $user->setAzureAdId($keyInfo['oid']);
                    }
                    $user->setlastLogin($datetime);
                    
                    $entityManager->persist($user);
                    $entityManager->flush();
                    // and return a UserBadge object containing the user identifier from the found token
                    return new UserBadge($user->getUserIdentifier());
                }
                else
                {
                    // If an application is authenticating, we will generate a fake user since app doesn't 
                    //exist neither in our DB not Azure
                    return new UserBadge($keyInfo['oid'], fn() => new AdminUser());
                }
                
            } catch (SignatureInvalidException $e) {
                if ($firstTry) continue;
                throw new HttpException(403, $e->getMessage(), $e);
            } catch (\UnexpectedValueException | \InvalidArgumentException | \DomainException $e) {
                throw new HttpException(403, $e->getMessage(), $e);
            }
        }
    }
}