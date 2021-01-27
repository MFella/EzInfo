
const toggle = () =>
{
    const temp = document.querySelector('.navbar-collapse.collapse.show');

    if(temp !== null)
    {   
        temp.classList.toggle('show');
    }
    
}


