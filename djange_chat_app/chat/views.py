import json
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render
from .models import Message, Chat
from django.http.response import HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.core import serializers


@login_required(login_url='/login/')
def index(request):
    if request.method == 'POST':
        myChat = Chat.objects.get(id=1)
        newMessage = Message.objects.create(text=request.POST['textmessage'], chat=myChat ,author=request.user, receiver=request.user)
        newMessageSerialized = serializers.serialize('json', [ newMessage ])
        return JsonResponse(newMessageSerialized[1:-1], safe = False)
    chatMessages = Message.objects.filter(chat__id=1)
    return render(request, 'chat/index.html', {'messages': chatMessages})

def logout_view(request):
    logout(request)
    return HttpResponseRedirect('/login/')

def login_view(request):
    redirect = request.GET.get('next')
    if redirect == None:
        redirect = '/chat/'
    if request.method == 'POST':
        user = authenticate(username=request.POST.get('username'), password=request.POST.get('password'))
        if user:
            login(request, user)
            return HttpResponseRedirect(request.POST.get('redirect'))
        else:
            return render(request, 'auth/login.html', {'wrongPassword': True, 'redirect': redirect})
    return render(request, 'auth/login.html', {'redirect': redirect})

def register_view(request):
    if request.method == 'POST':
        try:
            user = User.objects.get(username=request.POST.get('username'))
        except ObjectDoesNotExist:
            if request.POST.get('password') == request.POST.get('passwordAgain'):
                User.objects.create_user(username=request.POST.get('username'), password=request.POST.get('password'))
                user = authenticate(username=request.POST.get('username'), password=request.POST.get('password'))
                login(request, user)
                return HttpResponseRedirect('/chat/')
            else:
                return render(request, 'auth/register.html', {'wrongPassword': True, 'usernameExists': False})
        return render(request, 'auth/register.html', {'wrongPassword': False, 'usernameExists': True})
    return render(request, 'auth/register.html', {'wrongPassword': False, 'usernameExists': False})