#include <stdio.h>

int main(int argc, char const *argv[])
{
  volatile unsigned int * mmio;
  mmio = (unsigned int *)0xffff5654;

  int i = 0;
  while (1)
  {
    printf("i == 60\n");
    for (size_t i = 0; i < 1000000; i++)
    {
      *mmio = 0x60;
    }
    printf("i == 8956\n");
    for (size_t i = 0; i < 1000000; i++)
    {
      *mmio = 0x8956;
    }
  }
  return 0;
}
